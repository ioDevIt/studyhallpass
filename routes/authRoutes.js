import express from "express";
import passport from "passport";

import {trace} from "../modules/Mules/logsModule.js"

const Router = express.Router();

const redirectFN = (req, res, dataObj) => {
  console.log("In redirectFN");
  // console.log(req.user);

  ((req.user.id === 4) ?res.redirect("/"):res.redirect("/"))
};

Router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

Router.get("/google/callback",
  passport.authenticate("google", {failureRedirect:'/welcome'}),(req,res)=>{
    console.log('************* In /google/callback cookies *****************')
    console.log('req.cookies',req.cookies) // Set redirect to req.cookies.initialURL [Specific Cookie] instead of req.seession.initialURL
    // res.redirect((req.session.initialURL===undefined?"/":req.session.initialURL))
    console.log('-----------------------------------------')
    console.log('req.cookies.initialURL',req.cookies.initialURL)
    res.redirect((req.cookies.initialURL===undefined?"/":req.cookies.initialURL))
    // successRedirect: "/test"
    passport.authenticate()
  }
);

Router.get("/veracross", passport.authenticate("oauth2"));

Router.get("/veracross/callback",
  passport.authenticate("oauth2", { failureRedirect: "/nu" }),
  (req, res) => {
    console.log('************* In /veracross/callback *****************')
    // console.log("/auth/veracross/callback")
    // trace("",['/veracross/callback'],["yellow"])
    // trace("",['redirectFN(req, res)'],["green"])
    redirectFN(req, res);
  }
);

export default Router;