const express=require('express')
require('./db/config.js')
const cors=require('cors')
const User=require('./db/User')
const Product=require('./db/Product')
const  jwt= require("jsonwebtoken")
const jwtKey='e-com';
const app=express();
app.use(express.json())
app.use(cors())


app.post('/register',async(req,res)=>{
   const user =new User(req.body)
   let result=await user.save();
   result=result.toObject();
   delete result.password
  
   jwt.sign({result},jwtKey,{expiresIn:"2h"},(err,token)=>{
    if(err){
        res.send({result:"Something went Wrong"})
    }
        res.send({result,auth:token})
})
})

app.post('/login',async(req,res)=>{
    if(req.body.password && req.body.email){

        let user=await User.findOne(req.body).select('-password')
        if(user)
        {
            jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
                if(err){
                    res.send({result:"Something went Wrong"})
                }
                    res.send({user,auth:token})
            })
           // res.send(user)
        }
        else{
            res.send({result:'no user found'})
        }
    }
    else{
        res.send({result:"no user found"})
    }
   
   
})

app.post('/add-product',verifyToken,async(req,res)=>{

    let product=new Product(req.body);
    let result=await product.save()
    res.send(result)

});

app.get('/products',verifyToken,async(req,res)=>{
    let products= await Product.find()
    if(products.length>0){
        res.send(products)
    }
    else{
        res.send({result:"no product found"})
    }

})

app.delete("/product/:id",verifyToken,async(req,res)=>{
    
    const result= await Product.deleteOne({_id:req.params.id})
    res.send(result)
})
app.get("/product/:id",verifyToken,async(req,resp)=>{
    console.log(req.params.id)
    let result = await Product.findOne({_id:req.params.id})
    console.log(result)
    if(result){
        resp.send(result)
    }
    else{
        resp.send({result:"No record found"})
    }
})
app.put("/product/:id",verifyToken,async(req,res)=>{
    let result=await Product.updateOne(
        {_id:req.params.id},
        {
             $set :req.body  
        }
    )
    res.send(result)
})
app.get("/search/:key",verifyToken,async(req,res)=>{
    let result=await Product.find({
        "$or":[
            {name:{$regex:req.params.key}}
        ]
    });
    res.send(result)
})

function verifyToken(req,res,next){
    let token=req.headers['authorization']
    if(token){
          token=token.split(' ')[1];
          //console.log("midlewarecalled",token)
          jwt.verify(token,jwtKey,(err,valid)=>{
              if(err){
                   res.status(401).send({result:"please Provide valid Token"})
              }else{
                  next()
              }
              
          })

    }
    else{
        res.status(403).send({result:"please send token with header"})
    }
  
    
    
}
app.listen(5050,()=>{
    console.log("connected to port ///5050")
})