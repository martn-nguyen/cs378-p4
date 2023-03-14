import "./styles.css";
import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import Signup from "./signup";
import Signin from "./signin";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

const databaseURL = process.env.REACT_APP_DATABASEURL;

export default function App() {
  console.log(process.env);
  const [newItem, setNewItem] = useState("");
  const [groceryList, setGroceryList] = useState(null);
  const [userName, setUsername] = useState(null);
  const [userID, setUserID] = useState(null);
  const [signedIn, setSignedIn] = useState(false);

  // signup/login/sign code from
  // https://freecodecamp.org/news/use-firebase-authentication-in-a-react-app/

  // if logged in, have list and ability to add into list
  // as well as retrieve list
  // else display login page
  // need to have auth token
  // json object, add to list of json object
  // grocery lists

  // auth change, changes user
  // we can update stuff from our user here
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // user is signed in
        setUserID(user.uid);
        // "." is not valid on firebase keys, but "," are invalid in emails
        const cleanEmail = user.email.replace(/\./g, ",");
        setUsername(cleanEmail);
        getData(cleanEmail).then(() => {
          setSignedIn(true);
        });
      } else {
        // user is signed out
        console.log("user is logged out");
        getData(null).then(() => {
          setUsername(null);
          setUserID(null);
          setSignedIn(false);
        });
      }
    });
  }, [setSignedIn, setUsername, setUserID]);

  const logOut = () => {
    signOut(auth)
      .then(() => {
        //signout successful
        getData(null).then(() => {
          setUsername(null);
          setUserID(null);
          setSignedIn(false);
        });
        console.log("signed out successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const sendData = () => {
    if (userID) {
      fetch(`${databaseURL}/users/${userName}/shopping_list.json`)
        .then((res) => {
          if (res.status !== 200) {
            console.log("Error retrieving list: " + res.statusText);
          } else {
            return res.json();
          }
        })
        .then((res) => {
          if (res) {
            // add item into list
            updateUserData(res);
          } else {
            // empty list, must create a new array to put it in
            addUserData();
          }
        });
    }
  };

  const updateUserData = (currentList) => {
    if (userID) {
      currentList.push(newItem);
      const data = {
        shopping_list: currentList,
      };
      return fetch(`${databaseURL}/users/${userName}/.json`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }).then((res) => {
        if (res.status !== 200) {
          console.log("Error updating currentList.");
        } else {
          // re-update the current list on the screen
          getData(userName);
        }
      });
    }
  };

  const addUserData = () => {
    if (userID) {
      const data = {
        shopping_list: [newItem],
      };
      return fetch(`${databaseURL}/users/${userName}/.json`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((res) => {
        if (res.status !== 200) {
          console.log("There was an error.");
        } else {
          // display current list on screen
          getData(userName);
        }
      });
    }
  };

  const getData = async (userName) => {
    if (userID) {
      console.log(userName);
      fetch(`${databaseURL}/users/${userName}/shopping_list.json`)
        .then((res) => {
          console.log(`${databaseURL}/users/${userName}/shopping_list.json`);
          console.log(res);
          if (res.status !== 200) {
            console.log("There was an error: " + res.statusText);
            // throw new Error(res.statusText);
            return;
          } else {
            console.log("Successfully retrieved the data");
            return res.json();
          }
        })
        .then((res) => {
          if (res) {
            console.log(res);
            setGroceryList(res);
          } else {
            // no shopping list, add some items!
            setGroceryList(null);
          }
          // clear textbox for item
          setNewItem("");
        });
    }
  };

  const handleItemChange = (event) => {
    const target = event.target;
    setNewItem(target.value);
    console.log(target.value);
  };

  return (
    <div className="App">
      <h1>Grocery List</h1>
      {signedIn ? (
        <div>
          <Button variant="contained" onClick={() => logOut()}>
            Sign Out
          </Button>
          <h2>Welcome {userName}!</h2>
          <h2>Your shopping list:</h2>
          <Button variant="contained" onClick={() => getData(userName)}>
            Get List
          </Button>

          {groceryList ? (
            <div>
              {groceryList.map((item, index) => {
                return <p key={index}>{item}</p>;
              })}
            </div>
          ) : (
            <div>You have no items OR refresh!</div>
          )}

          <div className="container">
            <TextField
              id="outlined-basic"
              label="Add an item to your shopping list!"
              fullWidth
              value={newItem}
              onChange={handleItemChange}
              variant="outlined"
            />

            <Button variant="contained" onClick={() => sendData()}>
              Add item
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Signup />
          <Signin />
        </div>
      )}
    </div>
  );
}
