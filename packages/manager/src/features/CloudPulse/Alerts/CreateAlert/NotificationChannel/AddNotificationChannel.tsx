// import { notificationChannelSchema } from '@linode/validation';
// import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
// import { ErrorMessage, FormikProvider, setIn, useFormik } from 'formik';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { Typography } from 'src/components/Typography';

import { ChannelTypeOptions } from '../../constants';

import type { NotificationChannel } from '@linode/api-v4';
// import { CustomChannelAutocomplete } from './Custom/CustomChannelAutocomplete';

interface AddNotificationChannelProps {
  onCancel: () => void;
  onClickAddNotification: (notifications: any) => void;
  templateData: NotificationChannel[];
}

type TypeOptions = {
  label: string;
  value: string;
};

export const AddNotificationChannel = (props: AddNotificationChannelProps) => {
  const [type, setType] = React.useState<TypeOptions | null>(null);
  //   const [disableValidation, setDisableValidation] = React.useState(false);
  const { onCancel, onClickAddNotification, templateData } = props;

  const formMethods = useForm<NotificationChannel>({
    mode: 'onBlur',
    // resolver: yupResolver()
  });

  const { control, handleSubmit, setValue, watch } = formMethods;
  const onSubmit = handleSubmit((values) => {
    onClickAddNotification(values);
  });

  React.useEffect(() => {
    setValue('notification_type', type?.label ?? '');
  }, [setValue, type]);

  //   const formik = useFormik({
  //     initialValues: {
  //       templateName: '',
  //       type: '',
  //       values: {},
  //     },
  //     onSubmit: (values) => {
  //       onClickAddNotification(values);
  //     },
  //     validate: (values) => {
  //       if (disableValidation) {
  //         return {};
  //       }
  //       // Perform normal validation
  //       let errors = {};
  //     //   try {
  //     //     notificationChannelSchema.validateSync(values, { abortEarly: false });
  //     //   } catch (validationErrors) {
  //     //     validationErrors.inner.forEach((error: any) => {
  //     //       errors = setIn(errors, error.path, error.message);
  //     //     });
  //     //   }
  //       return errors;
  //     },
  //   });

  const selectedTypeTemplates =
    type && type.label
      ? templateData.filter(
          (template) => template.notification_type === type.value
        )
      : [];
  const templateOptions = selectedTypeTemplates
    ? selectedTypeTemplates.map((template) => ({
        label: template.template_name,
        value: template.template_name,
      }))
    : [];
  //   const selectedTemplate = watch('template_name');
  const selectedTemplate = selectedTypeTemplates.find(
    (template) => template.template_name === watch('template_name')
  );

  //   const handleTypeChange = (value: any, operation: string) => {
  //     if (operation === 'selectOption') {
  //       setValue('notification_type', value.label);
  //     }
  //   };

  //   const handleEmailChange = (newEmailList: string[]) => {
  //     const newValue = { ...formik.values.values, to: newEmailList };
  //     formik.setFieldValue('values', newValue);
  //   };

  //   const CustomErrorMessage = (props: any) => (
  //     <Box
  //       display={'flex'}
  //       flexDirection={'column'}
  //       gap={1}
  //       sx={(theme) => ({ color: theme.color.red })}
  //     >
  //       {props.children}
  //     </Box>
  //   );

  //   React.useEffect(() => {
  //     const isNewTemplate = !templateOptions.some(
  //       (obj) =>
  //         obj.label.toLocaleLowerCase() ===
  //         formik.values.templateName.toLocaleLowerCase()
  //     );
  //     if (!isNewTemplate && formik.values.templateName) {
  //       setDisableValidation(true);
  //     } else {
  //       setDisableValidation(false);
  //     }
  //   }, [formik.values.templateName]);

  //   console.log(formik.touched);
  // eslint-disable-next-line no-console
  console.log(templateData, templateOptions);
  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onSubmit}>
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.name === 'light' ? theme.color.grey5 : theme.color.grey9,
            borderRadius: 1,
            p: 2,
          })}
        >
          <Typography
            gutterBottom
            sx={(theme) => ({ color: theme.color.black })}
            variant="body2"
          >
            Channel settings
          </Typography>
          <Box>
            <Controller
              render={({ field, fieldState }) => (
                <Autocomplete
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                  label="Type"
                  onBlur={field.onBlur}
                  onChange={(_, newValue) => setType(newValue)}
                  options={ChannelTypeOptions}
                  value={type}
                />
              )}
              control={control}
              name={'notification_type'}
            ></Controller>

            {/* {formik.touched && formik.touched.type && formik.errors.type ? (
              <ErrorMessage component={CustomErrorMessage} name="type" />
            ) : null} */}
          </Box>
          <Box>
            <Controller
              render={({ field, fieldState }) => (
                <Autocomplete
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                  value={
                    field.value !== ''
                      ? { label: field.value, value: field.value }
                      : null
                  }
                  label="Channel"
                  onBlur={field.onBlur}
                  options={templateOptions}
                />
              )}
              control={control}
              name={'template_name'}
            />

            {/* {formik.touched &&
            formik.touched.templateName &&
            formik.errors.templateName ? (
              <ErrorMessage
                component={CustomErrorMessage}
                name="templateName"
              />
            ) : null} */}
          </Box>

          {/* {!disableValidation &&
          type &&
          type.value === 'Email' &&
          formik.values.templateName && (
            <Box>
              <Autocomplete
                onBlur={(event) => {
                  formik.handleBlur(event);
                  formik.setFieldTouched('values.to', true);
                }}
                placeholder={
                  formik.values.values &&
                  formik.values.values['to'] &&
                  formik.values.values['to'].length > 0
                    ? ' '
                    : 'Enter Email'
                }
                disabled={false}
                freeSolo
                label="To"
                multiple
                onChange={(_: any, newValue) => handleEmailChange(newValue)}
                options={[]}
              />
              {formik.touched.values &&
              formik.touched.values['to'] &&
              formik.errors.values &&
              formik.errors.values['to'] ? (
                <ErrorMessage component={CustomErrorMessage} name="values.to" />
              ) : null}

            </Box>
          )} */}
          {selectedTemplate && (
            <Box paddingTop={2}>
              <Grid container>
                <Grid item md={2}>
                  <Typography variant="h3">To:</Typography>
                </Grid>
                <Grid item md={10}>
                  {selectedTemplate.content &&
                    selectedTemplate.content.email_ids.length > 0 &&
                    selectedTemplate.content.email_ids.map(
                      (email: string, id: number) => (
                        <Chip key={id} label={email} />
                      )
                    )}
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Add channel',
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onCancel,
          }}
        />
      </form>
    </FormProvider>
  );
};
