import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from "@mui/material";
import InfluencerAccountDetails from "../pages/influencer/InfluencerAccountDetails";

const AddBankAccountDialog = ({ open, onClose, onSuccess }) => {
  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          borderTop: "4px solid",
          borderColor: "primary.main"
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Bank Account Required
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography color="text.secondary">
            To apply for this campaign, you must add at least one bank account.
            This is required to process payments after campaign approval.
          </Typography>
        </Box>

        <InfluencerAccountDetails onAccountAdded={onSuccess} />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel Application
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default AddBankAccountDialog;
