const prpl=require("prpl-server"),express=require("express"),bodyParser=require("body-parser"),logger=require("morgan"),mongoose=require("mongoose"),cors=require("cors"),app=express(),CommentController=require("./controllers/comment"),API_PORT=process.env.PORT||8080;app.use(bodyParser.urlencoded({extended:!1}));app.use(bodyParser.json());app.use(logger("dev"));app.use(cors());mongoose.connect("mongodb://admin:admin@ds113200.mlab.com:13200/mern-comment-box");mongoose.connection.on("connected",()=>{console.log("MongoDB connection established\nWaiting for the client...")});mongoose.connection.on("error",err=>{console.log("MongoDB connection error:"+err)});app.use("/comment",CommentController);app.get("/api/launch",(req,res)=>res.send("boom"));app.get("*",prpl.makeHandler(".",{builds:[{name:"/",browserCapabilities:["es2015","push"]},{name:"/fallback"}]}));app.listen(API_PORT,()=>console.log(`Listening on port ${API_PORT}`));