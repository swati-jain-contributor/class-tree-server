var mongoose = require('mongoose'),
autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var apartmentModel = new Schema({
    name: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zip: { type: String },    
    createdBy: { type: String },
    
    updatedBy: { type: String },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now },
    members: [{ type: Number, ref: 'Member' }],
    vendors: [{ type: Number, ref: 'Vendor' }],
    aptFunds:{
        currentBalance: { type: Number },
        transactions: [{ type: Number, ref: 'Transaction' }]
    },
    maintainenceFunds: [{ type: Number, ref: 'Maintainence' }],
    Discussions:[{ type: Number, ref: 'Discussion' }],
    Complaints:[{ type: Number, ref: 'Discussion' }],
    Notices:[{ type: Number, ref: 'Discussion' }],
    Questions:[{ type: Number, ref: 'Poll' }],
    requests:[{type:Number,ref:"Request"}]
});
var pollSchema=new Schema({
        text:{type:String},
        status: { type: String },
        answers:[{
            text:{type:String},
            votes:{type:String},
            votedBy:{type:String},
            status: { type: String }
        }],
        createdBy: { type: Date, default: Date.now },
        updatedBy: { type: Date, default: Date.now },
        createdOn: { type: Date, default: Date.now },
        updatedOn: { type: Date, default: Date.now }
    });
var discussionSchema=new Schema({
        title:{type:String},     
        msgs:[{ type: Number, ref: 'Msg' }],
        status: { type: String },
        type: { type: String },
        creator:{type:String},
        createdBy: { type: Number, ref: 'Member' },
        updatedBy: { type: Number, ref: 'Member' },
        createdOn: { type: Date, default: Date.now },
        updatedOn: { type: Date, default: Date.now }
    });
var msgSchema= new Schema({
            msg:{type:String},
            sendAt:{type:String},
            sendBy:{ type: Number, ref: 'Member' },
            status: { type: String },
            sender:{type:String}
        });
var maintainenceSchema= new Schema({
        type: { type: String },
        amt: { type: String },
        month: { type: Number },
        year: { type: Number },
        paidBy:{type:String},
        blockBy:{type:String},
        members: [{
            member:{ type: Number, ref: 'Member' } ,
            status: { type: String },
            paidOn: { type: Date },
            transaction:{ type: Number, ref: 'Transaction' }
        }],
        createdBy: { type: Number, ref: 'Member' },
        updatedBy: { type: Number, ref: 'Member' },
        createdOn: { type: Date, default: Date.now },
        updatedOn: { type: Date, default: Date.now }
    });
var memberSchema = new Schema({
        memberId: { type: String },
        username:{type:String},
        role: { type: String },
        status: { type: String },
        phone: { type: String },
        password: { type: String },
        name: { type: String },
        flat: { type: String },
        block: { type: String },
        family:{type:Number},
        createdBy: { type: String },
        updatedBy: { type: String },
        createdOn: { type: Date, default: Date.now },
        updatedOn: { type: Date, default: Date.now },
        vehicles: [{ type: Number, ref: 'Vehicle' }],
        otp:{type:Number},
        isVerified:{type:Boolean},
        otpTime:{type:Date},
        // family: [{ type: Number, ref: 'Family' }],
        transactions: [{ type: Number, ref: 'Transaction' }]
    });
var requestSchema= new Schema({
    requestId:{type:String},
    type:{type:String},
    status:{type:String},
    createdOn:{type:Date,default:Date.now},
    createdBy: { type: Number, ref: 'Member' },
    member:{ type: Number, ref: 'Member' },
    aptId:{type:Number}
});
var vehicleSchema = new Schema({
            vehicleNo: { type: String },
            vehicleType: { type: String },
            status: { type: String },
        });
// var familySchema =new Schema({
//             memberName: { type: String },
//             Status: { type: String },
//         });
var transactionSchema =new  Schema({
            tranId: { type: String },
            category: { type: String },
            date: { type: Date },
            amount: { type: Number },
            type: { type: String },
            remarks: { type: String },
            currency: { type: String },
            status: { type: String },
            createdBy: { type: String },
            updatedBy: { type: String },
            createdOn: { type: Date, default: Date.now },
            updatedOn: { type: Date, default: Date.now }
        });
var vendorSchema= new Schema({
        vendorName: { type: String },
        category: { type: String },
        vendorPhone: { type: String },
        likes: { type: Number },
        dislikes: { type: Number },
        likeBy: { type: String },
        dislikeBy: { type: String },
        status: { type: String },
        addedBy: { type: String },
        createdBy: { type: Number, ref: 'Member' },
        updatedBy: { type: Number, ref: 'Member' },
        createdOn: { type: Date, default: Date.now },
        updatedOn: { type: Date, default: Date.now }
    });
apartmentModel.plugin(autoIncrement.plugin, 'Apartment');
memberSchema.plugin(autoIncrement.plugin,'Member' );
discussionSchema.plugin(autoIncrement.plugin,'Discussion' );
msgSchema.plugin(autoIncrement.plugin,'Msg' );
vehicleSchema.plugin(autoIncrement.plugin,'Vehicle' );
vendorSchema.plugin(autoIncrement.plugin,'Vendor' );
//familySchema.plugin(autoIncrement.plugin,'Family' );
transactionSchema.plugin(autoIncrement.plugin,'Transaction' );
pollSchema.plugin(autoIncrement.plugin,'Poll' );
maintainenceSchema.plugin(autoIncrement.plugin,'Maintainence' );
requestSchema.plugin(autoIncrement.plugin,'Request' );
// module.exports = ;
// module.exports = ;
// module.exports = mongoose.model('Discussion', discussionSchema);
// module.exports = mongoose.model('Msg', msgSchema);
// module.exports = mongoose.model('Vehicle', vehicleSchema);
// module.exports = mongoose.model('Vendor', vendorSchema);
// module.exports = mongoose.model('Family', familySchema);
// module.exports = mongoose.model('Transaction', transactionSchema);
// module.exports = mongoose.model('Poll', pollSchema);
// module.exports = mongoose.model('Maintainence',maintainenceSchema);
module.exports={
    Apartment:mongoose.model('Apartment', apartmentModel),
    Member: mongoose.model('Member', memberSchema),
    Discussion:mongoose.model('Discussion', discussionSchema),
    Msg:mongoose.model('Msg', msgSchema),
    Vehicle:mongoose.model('Vehicle', vehicleSchema),
    Vendor:mongoose.model('Vendor', vendorSchema),
  //  Family:mongoose.model('Family', familySchema),
    Transaction:mongoose.model('Transaction', transactionSchema),
    Poll: mongoose.model('Poll', pollSchema),
    Maintainence:mongoose.model('Maintainence',maintainenceSchema),
    Request:mongoose.model("Request",requestSchema)
}