import { test, expect, type Page, type Route } from '@playwright/test';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { closeAllWindows } from '~/tests/helpers';

const SCHEMA_UI_USERS_API =
  /https:\/\/schema-ui-mf-remote\.vercel\.app\/api\/users(?:\/.*)?$/;

const USERS_SCHEMA = {
  username: { formType: 'text', required: [true, 'Field is Required'] },
  mobileNumber: {
    formType: 'text',
    minlength: [6, 'Too Short, Minimum 6'],
    maxlength: [12, 'Too Long , Maximum 12'],
  },
  OtherNewProp: { formType: 'checkbox', default: false },
  LastBoolean: {
    formType: 'checkbox',
    default: true,
    required: [true, 'Field is Required'],
  },
  selectItem: {
    default: 1,
    formType: 'select',
    options: [
      { val: 1, text: '--' },
      { val: 2, text: 'option' },
      { val: 3, text: 'third' },
    ],
  },
  phone: {
    formType: 'text',
    validate: {
      message: 'Expect phone number in format xxx-xxx-xxxx',
      regEx: '\\d{3}-\\d{3}-\\d{4}',
    },
    required: [true, 'User phone number required'],
  },
};

type UserRecord = {
  username: string;
  mobileNumber: string;
  OtherNewProp: boolean;
  LastBoolean: boolean;
  selectItem: number;
  phone: string;
  _id: string;
  createdAt: string;
};

const seedUser = (overrides: Partial<UserRecord> = {}): UserRecord => ({
  username: 'demo',
  mobileNumber: '5551234',
  OtherNewProp: false,
  LastBoolean: true,
  selectItem: 2,
  phone: '555-123-4567',
  _id: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

async function json(
  route: Route,
  status: number,
  body: unknown
): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function mockUsersApi(
  page: Page,
  store: { rows: UserRecord[]; puts: Array<{ id: string; body: unknown }> }
): Promise<void> {
  await page.route(SCHEMA_UI_USERS_API, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname.replace(/\/$/, '');

    if (path.endsWith('/schema') && method === 'GET') {
      await json(route, 200, USERS_SCHEMA);
      return;
    }

    const idMatch = path.match(/\/api\/users\/([^/]+)$/);

    if (method === 'GET' && !idMatch) {
      await json(route, 200, store.rows);
      return;
    }

    if (method === 'GET' && idMatch) {
      const row = store.rows.find((item) => item._id === idMatch[1]);
      if (!row) {
        await json(route, 404, { error: 'Not found' });
        return;
      }
      await json(route, 200, row);
      return;
    }

    if (method === 'POST' && !idMatch) {
      const body = request.postDataJSON() as Partial<UserRecord>;
      const created = seedUser({
        ...body,
        _id: `user-${store.rows.length + 1}`,
      });
      store.rows = [...store.rows, created];
      await json(route, 201, created);
      return;
    }

    if (method === 'PUT' && idMatch) {
      const body = request.postDataJSON() as Partial<UserRecord>;
      const index = store.rows.findIndex((item) => item._id === idMatch[1]);
      if (index < 0) {
        await json(route, 404, { error: 'Not found' });
        return;
      }
      store.puts.push({ id: idMatch[1], body });
      const updated = { ...store.rows[index], ...body, _id: idMatch[1] };
      store.rows = store.rows.map((row, rowIndex) =>
        rowIndex === index ? updated : row
      );
      await json(route, 200, updated);
      return;
    }

    await json(route, 404, { error: 'Not found' });
  });
}

async function openFormsWindow(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId(TEST_SELECTORS.APP_HEADING).waitFor();
  await closeAllWindows(page);

  const addForms = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.ADD_FORMS,
  });
  await expect(addForms).toBeVisible();
  await addForms.click();

  const heading = page.getByRole(TEST_SELECTORS.ROLES.HEADING, {
    name: /users/i,
  });
  const remoteError = page.getByRole('alert');

  await expect
    .poll(
      async () => {
        if (await heading.isVisible()) return 'loaded';
        if (await remoteError.isVisible()) return 'error';
        return 'pending';
      },
      { timeout: 20000 }
    )
    .toBe('loaded');
}

test.describe('Schema UI forms remote', () => {
  test.describe.configure({ timeout: 45000 });

  test('loads UsersPage forms from schema-ui-mf-remote', async ({ page }) => {
    await openFormsWindow(page);
    await expect(page.getByText(/schema-driven/i)).toBeVisible();
    await expect(page.getByTestId(TEST_SELECTORS.SCHEMA_UI_HOST)).toBeVisible();
  });

  test('creates a record via POST', async ({ page }) => {
    const store = { rows: [] as UserRecord[], puts: [] };
    await mockUsersApi(page, store);
    await openFormsWindow(page);

    const forms = page.getByTestId(TEST_SELECTORS.SCHEMA_UI_HOST);
    await expect(
      forms.getByRole('heading', { name: /new record|create record/i })
    ).toBeVisible();

    await forms.getByLabel(/username/i).fill('created-user');
    await forms.getByLabel(/mobile number/i).fill('5559999');
    await forms.getByLabel(/^phone$/i).fill('555-999-0000');
    await forms
      .getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.CREATE_RECORD,
      })
      .click();

    await expect(forms.getByText('created-user')).toBeVisible();
    expect(store.rows.some((row) => row.username === 'created-user')).toBe(
      true
    );
  });

  test('edits a record and saves via PUT', async ({ page }) => {
    const store = {
      rows: [seedUser()],
      puts: [] as Array<{ id: string; body: unknown }>,
    };
    await mockUsersApi(page, store);
    await openFormsWindow(page);

    const forms = page.getByTestId(TEST_SELECTORS.SCHEMA_UI_HOST);
    const editButton = forms
      .getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.EDIT_RECORD,
      })
      .first();
    await expect(editButton).toBeVisible();
    await editButton.evaluate((node) => (node as HTMLButtonElement).click());

    await expect(
      forms.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.UPDATE_RECORD,
      })
    ).toBeVisible();

    const username = forms.getByLabel(/username/i);
    await expect(username).toHaveValue('demo');
    await username.fill('updated-user');

    const updateButton = forms.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.UPDATE_RECORD,
    });
    await expect(updateButton).toBeVisible();
    await updateButton.click();

    await expect.poll(() => store.puts.length).toBe(1);
    expect(store.puts[0].id).toBe('user-1');
    expect(store.puts[0].body).toEqual(
      expect.objectContaining({ username: 'updated-user' })
    );
    await expect(forms.getByText('updated-user')).toBeVisible();
    await expect(
      forms.getByRole('heading', { name: /new record|create record/i })
    ).toBeVisible();
  });

  test('keeps the edited record when remote PUT returns 404', async ({
    page,
  }) => {
    const user = seedUser({ username: 'demo 4' });
    await page.route(SCHEMA_UI_USERS_API, async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname.replace(/\/$/, '');
      if (path.endsWith('/schema') && request.method() === 'GET') {
        await json(route, 200, USERS_SCHEMA);
        return;
      }
      if (request.method() === 'GET') {
        await json(route, 200, [user]);
        return;
      }
      if (request.method() === 'PUT') {
        await json(route, 404, { error: 'Not found' });
        return;
      }
      await json(route, 404, { error: 'Not found' });
    });

    await openFormsWindow(page);
    const forms = page.getByTestId(TEST_SELECTORS.SCHEMA_UI_HOST);
    await forms
      .getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.EDIT_RECORD,
      })
      .first()
      .evaluate((node) => (node as HTMLButtonElement).click());
    await expect(
      forms.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.UPDATE_RECORD,
      })
    ).toBeVisible();
    await forms.getByLabel(/username/i).fill('demo 4 updated');
    await forms
      .getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.UPDATE_RECORD,
      })
      .click();

    await expect(forms.getByText('demo 4 updated')).toBeVisible();
    await expect(
      forms.getByRole('heading', { name: /new record|create record/i })
    ).toBeVisible();
  });

  test('keeps edit mode when update request fails', async ({ page }) => {
    await page.route(SCHEMA_UI_USERS_API, async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname.replace(/\/$/, '');
      if (path.endsWith('/schema') && request.method() === 'GET') {
        await json(route, 200, USERS_SCHEMA);
        return;
      }
      if (request.method() === 'GET') {
        await json(route, 200, [seedUser()]);
        return;
      }
      if (request.method() === 'PUT') {
        await json(route, 500, { error: 'Update failed' });
        return;
      }
      await json(route, 404, { error: 'Not found' });
    });

    await openFormsWindow(page);
    const forms = page.getByTestId(TEST_SELECTORS.SCHEMA_UI_HOST);
    const editButton = forms
      .getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.EDIT_RECORD,
      })
      .first();
    await editButton.evaluate((node) => (node as HTMLButtonElement).click());
    await expect(
      forms.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.UPDATE_RECORD,
      })
    ).toBeVisible();
    await forms
      .getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.UPDATE_RECORD,
      })
      .click();
    await expect(
      forms.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.UPDATE_RECORD,
      })
    ).toBeVisible();
    await expect(forms.getByText('demo')).toBeVisible();
  });
});
