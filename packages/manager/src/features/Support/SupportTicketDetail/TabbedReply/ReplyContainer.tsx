import { SupportReply, uploadAttachment } from '@linode/api-v4/lib/support';
import { APIError } from '@linode/api-v4/lib/types';
import { lensPath, set } from 'ramda';
import * as React from 'react';
import Accordion from 'src/components/Accordion';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { Notice } from 'src/components/Notice/Notice';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { storage } from 'src/utilities/storage';
import { debounce } from 'throttle-debounce';
import AttachFileForm from '../../AttachFileForm';
import { FileAttachment } from '../../index';
import Reference from './MarkdownReference';
import { ReplyActions } from './ReplyActions';
import TabbedReply from './TabbedReply';
import { useSupportTicketReplyMutation } from 'src/queries/support';

const useStyles = makeStyles((theme: Theme) => ({
  replyContainer: {
    paddingLeft: theme.spacing(8),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(6),
    },
  },
  expPanelSummary: {
    backgroundColor: theme.name === 'dark' ? theme.bg.main : theme.bg.white,
    borderTop: `1px solid ${theme.bg.main}`,
    paddingTop: theme.spacing(),
  },
  referenceRoot: {
    '& > p': {
      marginBottom: theme.spacing(),
    },
  },
  reference: {
    [theme.breakpoints.up('sm')]: {
      marginTop: theme.spacing(7),
      marginRight: 4,
      marginLeft: 4,
      padding: `0 !important`,
    },
    [theme.breakpoints.down('sm')]: {
      padding: `${theme.spacing(2)} !important`,
    },
  },
}));

interface Props {
  closable: boolean;
  onSuccess?: (newReply: SupportReply) => void;
  reloadAttachments: () => void;
  ticketId: number;
  lastReply?: SupportReply;
}

export const ReplyContainer = (props: Props) => {
  const classes = useStyles();

  const { onSuccess, reloadAttachments, lastReply, ...rest } = props;

  const { mutateAsync: createReply } = useSupportTicketReplyMutation();

  const textFromStorage = storage.ticketReply.get();
  const isTextFromStorageForCurrentTicket =
    textFromStorage.ticketId === props.ticketId;

  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [value, setValue] = React.useState<string>(
    isTextFromStorageForCurrentTicket &&
      lastReply?.description !== textFromStorage.text
      ? textFromStorage.text
      : ''
  );

  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [files, setFiles] = React.useState<FileAttachment[]>([]);

  const saveText = (_text: string, _ticketId: number) => {
    storage.ticketReply.set({ text: _text, ticketId: _ticketId });
  };

  const debouncedSave = React.useRef(debounce(500, false, saveText)).current;

  React.useEffect(() => {
    if (value.length > 0) {
      debouncedSave(value, props.ticketId);
    }
  }, [value, props.ticketId]);

  const submitForm = () => {
    setSubmitting(true);
    setErrors(undefined);

    /*
      Send the reply as the user entered it to the server - no restrictions here
      since we're sanitizing again at render time.
    */
    createReply({ description: value, ticket_id: props.ticketId })
      .then((response) => {
        /** onSuccess callback */
        if (onSuccess) {
          onSuccess(response);
        }

        setSubmitting(false);
        setValue('');
      })
      .then(() => {
        /* Make sure the reply will go through before attaching files */
        /* Send each file */
        files.forEach((file, idx) => {
          if (file.uploaded) {
            return;
          }

          setFiles(set(lensPath([idx, 'uploading']), true));

          const formData = new FormData();
          formData.append('file', file.file ?? '');

          uploadAttachment(props.ticketId, formData)
            .then(() => {
              const nullFileState = {
                file: null,
                uploading: false,
                uploaded: true,
              };

              setFiles(set(lensPath([idx]), nullFileState));
              reloadAttachments();
            })
            /*
             * Note! We want the first few uploads to succeed even if the last few
             * fail! Don't try to aggregate errors!
             */
            .catch((fileErrors) => {
              setFiles(set(lensPath([idx, 'uploading']), false));

              const newErrors = getAPIErrorOrDefault(
                fileErrors,
                'There was an error attaching this file. Please try again.'
              );

              setFiles(set(lensPath([idx, 'errors']), newErrors));
            });
        });
      })
      .catch((fetchErrors) => {
        setErrors(
          getAPIErrorOrDefault(
            fetchErrors,
            'There was an error creating your reply. Please try again.'
          )
        );
        setSubmitting(false);
      });
  };

  const errorMap = getErrorMap(['description'], errors);

  return (
    <Grid className={classes.replyContainer}>
      {errorMap.none && (
        <Notice error spacingBottom={8} spacingTop={16} text={errorMap.none} />
      )}
      <Grid>
        <TabbedReply
          error={errorMap.description}
          handleChange={setValue}
          isReply
          value={value}
        />
      </Grid>
      <Grid style={{ marginTop: 8 }}>
        <Accordion
          heading="Formatting Tips"
          defaultExpanded={false}
          detailProps={{ className: classes.expPanelSummary }}
        >
          <Reference isReply rootClass={classes.referenceRoot} />
        </Accordion>
      </Grid>
      <Grid>
        <AttachFileForm
          files={files}
          updateFiles={(filesToAttach: FileAttachment[]) =>
            setFiles(filesToAttach)
          }
        />
        <ReplyActions
          isSubmitting={isSubmitting}
          value={value}
          submitForm={submitForm}
          {...rest}
        />
      </Grid>
    </Grid>
  );
};
