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
import { ADMIN_USERS } from "utils/constants";
const NotificationsTab: FC<{
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}> = ({ userConfigSnapshot }) => {
  const updatingAnything = !!userConfigSnapshot?.metadata.fromCache;
  console.log(process.env);
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Email
      </Typography>
      <Typography variant="body1" gutterBottom>
        {ADMIN_USERS}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Hello
      </Typography>
      <FormGroup>
        <FirestoreBackedTextField
          label="Email address"
          disabled={updatingAnything}
          docSnap={userConfigSnapshot!}
          fieldPath="preferences.notifications.email.email"
          variant="standard"
          isValid={(email) => !email || isValidEmail(email)}
          helperText={(_, validEmail) =>
            validEmail ? "" : "Invalid email address"
          }
          sx={{ maxWidth: 300 }}
          InputProps={{ inputComponent: EmailInput as any }}
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
