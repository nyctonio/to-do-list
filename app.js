const express = require('express');
const bodyparser=require("body-parser");
const https = require('https');
const mongoose= require('mongoose');
const port = process.env.PORT || 3000;
const _=require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://riteshadmin:<password>@cluster0.hvrck.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
    name : String
}

const Item = mongoose.model("Item",itemSchema);

const item1=new Item ({
    name:"Welcome to your Todolist!"
});
const item2=new Item ({
    name:"Hit + to add new item"
});
const item3=new Item ({
    name:"<--Hit this to delete the item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items :[itemSchema]
};
const List = mongoose.model("List",listSchema);



app.get('/',(req,res)=>{
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("sucessfully submitted");
                }
            })
            res.redirect('/');
        }else{
            res.render("list",{listTitle:"Today",newlistitem:foundItems});
        }
        
    });
    
});

app.get('/:listRoute',function (req,res) {

    const customList=_.capitalize((req.params.listRoute));
    List.findOne({name:customList }, function (err,result) {
        if (!err) {
            if (!result) {
                const list=new List({
                    name: customList,
                    items: defaultItems
                })
                list.save();
                res.redirect('/'+customList)
            } else {
                console.log(result);
                res.render('list', {
                    listTitle: result.name,
                    newlistitem: result.items})
            }
        } 

    });
})

app.post('/',(req,res)=>{
    const temp=req.body.val;
    const listname = req.body.list;

    const item=new Item ({
        name:temp
    });
    if(listname==="Today"){
        item.save();
        res.redirect('/');
    }else{
        List.findOne({name:listname},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect('/'+listname);
        })
    }
    
});
app.post('/delete',(req,res)=>{
    console.log('yep');
    const rem=req.body.check;
    const listName=req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(rem,function(err){
            if(!err){
                console.log("removed");
                res.redirect('/');
            }
        })
    }else{
        List.findOneAndUpdate({name:listName},{$pull :{items : {_id:rem}}},function(err,result){
            if(!err){
                res.redirect('/'+listName);
            }
        })
    }
    
});

app.listen(port,() =>{
    console.log("server running");
});
