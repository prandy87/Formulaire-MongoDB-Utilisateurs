require("dotenv").config();
const express = require("express");
const app = express();
const formidableMiddleware = require("express-formidable");
const cors = require("cors");
app.use(formidableMiddleware());
app.use(cors());

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);

const User = require("./Models/User");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

app.get("/", (req, res) => {
  res.json({ message: "salut" });
});

app.post("/signup", async (req, res) => {
  console.log(req.fields);
  if (
    req.fields.gender &&
    req.fields.firstName &&
    req.fields.lastName &&
    req.fields.email &&
    req.fields.password
  ) {
    try {
      const registeredEmail = await User.findOne({ email: req.fields.email });
      if (!registeredEmail) {
        try {
          const salt = uid2(16);
          const hash = SHA256(req.fields.password + salt).toString(encBase64);
          const token = uid2(16);

          const newUser = new User({
            email: req.fields.email,
            account: {
              gender: req.fields.gender,
              firstName: req.fields.firstName,
              lastName: req.fields.lastName,
              birthday: req.fields.birthday,
              address: req.fields.address,
              zipcode: req.fields.zipcode,
              city: req.fields.city,
              comment: req.fields.comment,
            },
            token: token,
            hash: hash,
            salt: salt,
          });
          await newUser.save();
          res.status(200).json({
            _id: newUser.id,
            token: newUser.token,
            account: newUser.account,
          });
        } catch (error) {
          res.status(400).json({ message: "Cet email est déjà  enregistré" });
        }
      } else {
        res.status(400).json({ message: "Cet email est déjà  enregistré" });
      }
    } catch (error) {
      res.json({ message: error.message });
    }
  } else {
    res
      .status(400)
      .json(
        "Veuillez renseigner tous les champs nécessaires/vos mots de passe ne sont pas identiques"
      );
  }
});

app.post("/signin", async (req, res) => {
  console.log(req.fields);

  if (req.fields.password && req.fields.email) {
    const findUser = await User.findOne({ email: req.fields.email });
    if (!findUser) {
      res.status(400).json("Email invalide");
    } else {
      try {
        if (
          findUser.hash !==
          SHA256(req.fields.password + findUser.salt).toString(encBase64)
        ) {
          res.status(401).json("Mot de passe invalide !");
        } else {
          res.status(200).json({
            _id: findUser._id,
            token: findUser.token,
            account: findUser.account,
          });
        }
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  } else {
    res
      .status(400)
      .json("Veuillez renseigner votre email et/ou votre mot de passe");
  }
});

app.post("/update", async (req, res) => {
  console.log("toto");
  res.json({ message: "toto" });
  // try {
  //   const updateUser = await User.findByIdAndUpdate(req.fields._id, {
  //     lastName: req.fields.lastName,
  //   });
  //   await updateUser.save();

  //   if (updateUser) {
  //     res.status(200).json({ message: "user updated", user: updateUser });
  //   } else {
  //     res.status(404).json({ message: "user not found" });
  //   }
  // } catch (error) {
  //   res.status(400).json({ error: error.message });
  // }
});

app.all("*", (req, res) => {
  res.status(400).json({ message: "Page demandée introuvable" });
});

app.listen(process.env.PORT, () => {
  console.log("Serveur en état de marche");
});
