module.exports=(sequelize,DataTypes)=>{
    const time=sequelize.define("time",{
           "from":{
               type:DataTypes.FLOAT,
               allowNull:false
           },
           "to":{
               type:DataTypes.FLOAT,
               allowNull:false
           }
    });
    time.associate=model=>{
        time.belongsToMany(model.doctor,{through:model.workTime});
    };
    return time;
};