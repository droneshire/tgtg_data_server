import React, { FC } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Divider,
} from "@mui/material";

import { ClientConfig } from "types/user";
import {
  EmailInput,
  FirestoreBackedSwitch,
  FirestoreBackedTextField,
  FirestoreBackedTimeZoneSelect,
} from "components/utils/forms";
import { isValidEmail } from "utils/validators";
const NotificationsTab: FC<{
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}> = ({ userConfigSnapshot }) => {
  const updatingAnything = !!userConfigSnapshot?.metadata.fromCache;
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Preferences
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <FirestoreBackedSwitch
              disabled={updatingAnything}
              docSnap={userConfigSnapshot!}
              fieldPath="preferences.deleteDataOnDownload"
              checkBox
            />
          }
          label="Delete Data on Download"
        />
        <FormControlLabel
          control={
            <FirestoreBackedSwitch
              disabled={updatingAnything}
              docSnap={userConfigSnapshot!}
              fieldPath="preferences.notifications.email.updatesEnabled"
              checkBox
            />
          }
          label="Email updates"
        />
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      <FirestoreBackedTimeZoneSelect
        disabled={updatingAnything}
        docSnap={userConfigSnapshot!}
        fieldPath="preferences.searchTimeZone"
      />
    </>
  );
};

export default NotificationsTab;
