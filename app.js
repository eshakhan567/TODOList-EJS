



const express = require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const _=require("lodash");

const app = express();
mongoose.connect('mongodb://127.0.0.1:27017/todoListDB');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// Item Schema
const itemSchema={
    name: String
}
//List Schema
const listSchema={
name : String,
items : [itemSchema]
}
//Item model
const Item=mongoose.model("Item" , itemSchema);

//List model
const List=mongoose.model("List", listSchema);

const item1=new Item({
    name:"Welcome to our to do list!"
})

const item2=new Item({
    name:"Hit button to add new item"
})

const item3=new Item({
    name:"<--Hit this to delete an item"
})
const defaultItem=[item1, item2,item3];

app.get("/", function(req,res){
    Item.find({}).then(foundItems=>{
       if(foundItems.length===0){

        Item.insertMany(defaultItem);

       res.redirect("/");
    }   else{
        res.render("list",{listTitle:"Today", NewItems:foundItems});
    }
    })
})

//if user wants to go dynamically to another route 
app.get("/:customRoute", function(req,res){
    const customRouteName= _.capitalize(req.params.customRoute);
    List.findOne({name:customRouteName}).then(foundList=>{
        if(!foundList){
            //if no list found then create a new list with corresponding route
            const list=new List({
                name:customRouteName,
                items:defaultItem
            })
            list.save();
            res.redirect("/" + customRouteName);
        }   else{
            res.render("list", {listTitle:foundList.name ,NewItems:foundList.items });
        }
    })
    
})

app.post("/", function(req,res){
    const itemName=req.body.newItem;
    const listName= req.body.list;

    const item=new Item({
        name: itemName
    })
    if (listName==="Today"){
    // if the listName is the home route ,saves item to the database and returns back to the home route
    item.save();
    res.redirect("/");
    }   else{
        //if user access listName dynamically then saves new items to the foundList and save them
        List.findOne({name:listName}).then(foundList=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
})
app.post("/delete" , function(req,res){
    const checkedItem= req.body.checkbox;
    const listName= req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndDelete(checkedItem).then(err=>{
            if (err) {
                console.log(err); // Log any errors for debugging purposes
            } else {
                console.log("Item deleted successfully");
            }
            res.redirect("/"); // Redirect to the home route after deletion
        });
    } else{
        // if the route is other than home route than find by id and remove elements and redirect to the same route
        List.findOneAndUpdate({name:listName} , {$pull: {items: {_id:checkedItem}}}).then(foundList=>{
            res.redirect("/" + listName);
        })
    }
})

app.listen(3000,function(){
    console.log("Server is running on port 3000");
})
