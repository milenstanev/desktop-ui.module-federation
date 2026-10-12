import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import styles from './FormEditor.module.css';
import { FORM_EDITOR_STRINGS, FORM_TYPES } from '~/shared/constants';
import {
  fetchUsers,
  fetchFormSchema,
  updateUser,
  FormSchema,
  UserData,
} from '~/shared/utils/mockApi';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import {
  TextField,
  NumberField,
  CheckboxField,
  SelectField,
} from '~/shared/forms';

const FormEditor: React.FC = () => {
  //region states
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [formData, setFormData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [asyncError, setAsyncError] = useState<boolean>(false);
  //endregion

  //region hooks
  const firstNameRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
  } = useForm<UserData>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  //endregion

  //region callbacks
  const onSubmit = useCallback(
    async (data: UserData) => {
      if (!formData) return;
      try {
        const result = await updateUser(formData._id, data);
        if (result.success) {
          alert(FORM_EDITOR_STRINGS.ALERT_SUCCESS);
          setFormData(result.user);
          reset(result.user);
        } else {
          alert(FORM_EDITOR_STRINGS.ALERT_ERROR);
        }
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : FORM_EDITOR_STRINGS.ALERT_ERROR
        );
      }
    },
    [formData, reset]
  );
  //endregion

  const getFormattedLabel = (fieldName: string): string => {
    let label = fieldName.replace(/([a-z])([A-Z])/g, '$1 $2');
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const renderFormField = (fieldName: string, index: number) => {
    if (!formSchema) return null;

    const fieldSchema = formSchema[fieldName];
    const label = getFormattedLabel(fieldName);
    const validation = fieldSchema.validation;
    const isFirstField = index === 0;

    switch (fieldSchema.formType) {
      case FORM_TYPES.TEXT:
        return (
          <TextField
            key={fieldName}
            name={fieldName}
            label={label}
            register={register}
            errors={errors}
            validation={validation}
            ref={isFirstField ? firstNameRef : undefined}
          />
        );
      case FORM_TYPES.NUMBER:
        return (
          <NumberField
            key={fieldName}
            name={fieldName}
            label={label}
            register={register}
            errors={errors}
            validation={validation}
          />
        );
      case FORM_TYPES.CHECKBOX:
        return (
          <CheckboxField
            key={fieldName}
            name={fieldName}
            label={label}
            register={register}
            errors={errors}
          />
        );
      case FORM_TYPES.SELECT:
        return (
          <SelectField
            key={fieldName}
            name={fieldName}
            label={label}
            options={fieldSchema.options || []}
            register={register}
            errors={errors}
            validation={validation}
          />
        );
      default:
        console.error(FORM_EDITOR_STRINGS.ERROR_UNKNOWN_TYPE);
        return null;
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0] as keyof UserData;
      setFocus(firstErrorField);
    }
  }, [errors, setFocus]);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchAllData = async () => {
      try {
        const [users, schema] = await Promise.all([
          fetchUsers(),
          fetchFormSchema(),
        ]);

        if (!isMountedRef.current) return;

        const user = users[0];
        setFormData(user);
        setFormSchema(schema);
        reset(user);
      } catch (error) {
        if (!isMountedRef.current) return;
        setAsyncError(true);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    void fetchAllData();

    return () => {
      isMountedRef.current = false;
    };
  }, [reset]);

  useEffect(() => {
    if (asyncError) {
      throw new Error(FORM_EDITOR_STRINGS.ERROR_API_PROBLEM);
    }
  }, [asyncError]);

  if (isLoading) {
    return (
      <div data-testid={TEST_SELECTORS.FORM_LOADING}>
        {FORM_EDITOR_STRINGS.LOADING}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      data-testid={TEST_SELECTORS.FORM_EDITOR}
    >
      {formSchema &&
        Object.keys(formSchema).map((fieldName, index) =>
          renderFormField(fieldName, index)
        )}
      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isSubmitting}
        data-testid={TEST_SELECTORS.FORM_SUBMIT_BUTTON}
      >
        {FORM_EDITOR_STRINGS.SUBMIT_BUTTON}
      </button>
    </form>
  );
};

export default FormEditor;
