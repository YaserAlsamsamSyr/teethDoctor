const availabelDate=(date)=>{
    let now=new Date();
    now=now.getTime();
    date=date.getTime();
    if(date>=now)
        return true;
    return false;
};

const checkToday=(date)=>{
    let today=new Date();
    if(
          today.getFullYear()===date.getFullYear()
       && today.getMonth()===date.getMonth()
       && today.getDate()===date.getDate()
       )
        return true;
    return false;
};

const oldDate=(date)=>{
    let now=new Date();
    now=now.getTime()-(3600000*12);
    date=date.getTime();
    if(date<now)
        return true;
    return false;
};

module.exports={
    availabelDate,
    checkToday,
    oldDate
};