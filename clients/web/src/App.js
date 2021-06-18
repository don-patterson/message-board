import React, {useEffect, useState} from "react";
import {Box, Button, makeStyles, Snackbar, TextField} from "@material-ui/core";
import {GetApp as DownArrow, Publish as UpArrow} from "@material-ui/icons";

const getRemoteClipboard = async () => {
  const response = await fetch("/clipboard");
  if (!response.ok) {
    return "error";
  }
  const json = await response.json();
  return json.text;
};

const updateRemoteClipboard = async text => {
  const response = await fetch("/clipboard", {
    method: "POST",
    body: JSON.stringify({text}),
  });
  if (!response.ok) {
    return "error";
  }
  const json = await response.json();
  return json.text;
};

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  gapLeft: {
    marginLeft: theme.spacing(1),
  },
}));

const App = () => {
  const classes = useStyles();
  const [localText, setLocalText] = useState("");
  const [serverText, setServerText] = useState("empty");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleLocalTextChange = e => {
    setLocalText(e.target.value);
  };
  const handleServerTextChange = e => {
    setServerText(e.target.value);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  const toast = text => {
    setToastMessage(text);
    setShowToast(true);
  };

  const handleSend = async () => {
    setServerText(await updateRemoteClipboard(localText));
    toast("Sent!");
  };

  const _copyListener = e => {
    document.removeEventListener("copy", _copyListener, true);
    e.preventDefault();
    e.clipboardData.clearData();
    e.clipboardData.setData("text/plain", serverText);
  };

  const handleCopy = () => {
    document.addEventListener("copy", _copyListener, true);
    document.execCommand("copy");
    toast("Copied!");
  };

  useEffect(() => {
    (async () => {
      setServerText(await getRemoteClipboard());
    })();
  }, []);

  return (
    <div className={classes.root}>
      <Box p={1} display="flex" flexDirection="row" flexWrap="nowrap">
        <Button
          variant="contained"
          color="primary"
          onClick={handleCopy}
          startIcon={<DownArrow />}
        >
          Copy
        </Button>
        <TextField
          className={classes.gapLeft}
          label="Remote clipboard"
          value={serverText}
          onChange={handleServerTextChange}
          fullWidth
          inputProps={{readOnly: true}}
        />
      </Box>
      <Box p={1} display="flex" flexDirection="row" flexWrap="nowrap">
        <TextField
          label="Paste here to update"
          value={localText}
          onChange={handleLocalTextChange}
          fullWidth
        />
        <Button
          className={classes.gapLeft}
          variant="contained"
          color="primary"
          onClick={handleSend}
          endIcon={<UpArrow />}
          disabled={localText === ""}
        >
          Send
        </Button>
      </Box>
      <Snackbar
        open={showToast}
        autoHideDuration={2000}
        onClose={hideToast}
        message={toastMessage}
      />
      <Button
        onClick={async () => {
          console.log("prompt for write");
          const response = await navigator.permissions.query({
            name: "clipboard-write",
          });
          console.log("response", response);
        }}
      >
        Prompt for Clipboard Write
      </Button>
      <Button
        onClick={async () => {
          console.log("try write");
          await navigator.clipboard.writeText("blah 123");
        }}
      >
        Try Clipboard Write
      </Button>
    </div>
  );
};

export default App;