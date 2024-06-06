module.exports=(sequelize,DataTypes)=>{
    const meeting=sequelize.define("meeting",{
           "totalPrice":{
               type:DataTypes.DOUBLE,
               allowNull:true,
               defaultValue:0
           },
           "remainingPrice":{
               type:DataTypes.DOUBLE,
               allowNull:true,
               defaultValue:0
           },
           "image":{
               type:DataTypes.STRING,
               allowNull:true,
               defaultValue:"NO IMAGE"
           },
           "notics":{
            type:DataTypes.STRING,
            allowNull:true,
            defaultValue:""
           },
           "isBooked":{
            type:DataTypes.BOOLEAN,
            defaultValue:false
           }
    });
    meeting.associate=model=>{
        meeting.belongsTo(model.patient);
        meeting.hasMany(model.treatment,{onDelete:"CASCADE",as:'followUpTreatment'});
    };
    return meeting;
};