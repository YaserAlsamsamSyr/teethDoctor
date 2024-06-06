module.exports=(sequelize,DataTypes)=>{
    const treatment=sequelize.define("treatment",{
           "nextMeetingDate":{
               type:DataTypes.DATE,
               allowNull:false,
           },
           "diagnosis":{
               type:DataTypes.STRING,
               allowNull:true,
               defaultValue:""
           },
           "pricePaid":{
               type:DataTypes.DOUBLE,
               allowNull:true,
               defaultValue:0
           }
    });
    treatment.associate=model=>{
        treatment.belongsTo(model.meeting);
    };
    return treatment;
};