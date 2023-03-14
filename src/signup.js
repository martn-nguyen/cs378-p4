import "./styles.css";
import { useState } from "react";
import {
  TextField,
  Button,
} from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // signed in
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  const handleEmailChange = (event) => {
    const target = event.target;
    setEmail(target.value);
    console.log(target.value);
  };

  const handlePasswordChange = (event) => {
    const target = event.target;
    setPassword(target.value);
    console.log(target.value);
  };

  return (
    <div className="container">
      <h2>Sign Up</h2>
      <TextField
        id="outlined-basic"
        label="Email"
        fullWidth
        value={email}
        onChange={handleEmailChange}
        variant="outlined"
      />
      <TextField
        id="outlined-basic"
        label="Password"
        fullWidth
        value={password}
        onChange={handlePasswordChange}
        variant="outlined"
      />
      <Button variant="contained" type="submit" onClick={onSubmit}>
        Sign Up
      </Button>
    </div>
  );
}
