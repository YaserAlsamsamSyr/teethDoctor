const joi=require('joi');

const login=joi.object({
   userName:joi.string().max(40).required().messages({
    'string.empty':"please fill all failds",
    'string.base':"invalid username",
    'string.max':"username must be maximum 40 characters",
   }),
   password:joi.string().min(8).max(20).required().messages({
    'string.empty':"please fill all failds",
    'string.base':'invalid password',
    'string.min':"password must be atleast 8 characters",
    'string.max':"password must be maximum 20 characters",
   })
});

const checkMeeting=joi.object({
    totalPrice         :joi.number().required().messages({
        'number.empty':"please fill all failds",
        'number.base':"invalid total price value"
       }),
    remainingPrice     :joi.number().required().messages({
        'number.empty':"please fill all failds",
        'number.base':"invalid total price value"
       }),
    image:joi.string().max(110).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid image',
        'string.max':'image must be maximum 110 characters'
    }),
    notics             :joi.string().required().messages({
        'string.empty':"please fill all failds",
        'string.base':"invalid notics"
       }),
    followUpTreatmentId:joi.number().integer().required().messages({
        'number.empty':"please fill all failds",
        'number.integer':"invalid value",
        'number.base':"invalid id value"
       }),
    meetingId          :joi.number().integer().required().messages({
        'number.empty':"please fill all failds",
        'number.integer':"invalid value",
        'number.base':"invalid id value"
       }),
    nextMeetingDate    :joi.date().required().messages({
        'date.empty':"please fill all failds",
        'date.base':"invalid date"
       }),
    diagnosis          :joi.string().required().messages({
        'string.empty':"please fill all failds",
        'string.base':"invalid diagnosis value"
       }),
    pricePaid          :joi.number().required().messages({
        'number.empty':"please fill all failds",
        'number.base':"invalid price paid value"
       })
});

const checkId=joi.object({
    id:joi.number().integer().required().messages({
        'number.integer':"invalid value",
        'number.empty':"invalid value",
        'number.base':"invalid value"
    })
 }); 

const checkPatient=joi.object({
        fName:joi.string().required().max(40).messages({
            'string.empty':"please fill all failds",
            'string.base':"invalid first name",
            'string.max':'first name must be maximum 40 characters'
           }),
        lName:joi.string().required().max(40).messages({
            'string.empty':"please fill all failds",
            'string.base':"invalid last name",
            'string.max':'last name must be maximum 40 characters'
           }),
        faName:joi.string().required().max(40).messages({
            'string.empty':"please fill all failds",
            'string.base':"invalid father name",
            'string.max':'father name must be maximum 40 characters'
           }),
        address:joi.string().required().max(80).messages({
            'string.empty':"please fill all failds",
            'string.base':"invalid address",
            'string.max':'address must be maximum 80 characters'
           }),
        age:joi.number().integer().max(110).required().messages({
            'number.empty':"please fill all failds",
            'number.integer':"invalid age",
            'number.base':"invalid age",
            'number.max':'age must be maximum 110'
         }),
        birthDate:joi.string().required().max(40).messages({
            'string.empty':"please fill all failds",
            'string.base':"invalid date",
            'string.max':'date must be maximum 40 characters'
           }) ,
        mobileNumber:joi.number().integer().min(900000000).max(999999999999).required().messages({
            'number.empty':"please fill all failds",
            'number.integer':"invalid mobile number",
            'number.base':"invalid mobile number",
            'number.max':'mobile number must be maximum 12 digits',
            'number.min':'mobile number must be minimum 9 digits'
        }) ,
        landNumber: joi.number().integer().min(1000000).max(9999999999).required().messages({
            'number.empty':"please fill all failds",
            'number.integer':"invalid land number",
            'number.base':"invalid land number",
            'number.max':'land number must be maximum 10 digits',
            'number.min':'land number must be minimum 7 digits'
        }),
        userName: joi.string().required().max(40).messages({
            'string.empty':"please fill all failds",
            'string.base':"invalid user name",
            'string.max':'user name must be maximum 40 characters'
           }),
        familyStation:joi.string().required().max(10).messages({
            'string.empty':"please fill all failds",
            'string.base':"invalid family station",
            'string.max':'family station must be maximum 10 characters'
           }),
        password: joi.string().required().min(8).max(20).messages({
            'string.empty':"please fill all failds",
            'string.base':"invalid password",
            'string.max':'password must be maximum 20 characters',
            'string.min':'password must be minimum 8 characters'
           })
});

const checkDate=joi.object({
    date:joi.date().messages({
        'date.base':"invalid date"
    }),   
    nextMeetingDate:joi.date().messages({
        'date.base':"invalid date"
    }),
 }); 

const checkDoctor=joi.object({
    fName:        joi.string().max(40).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid first name',
        'string.max':'first name must be maximum 40 characters'
    }),
    lName:        joi.string().max(40).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid last name',
        'string.max':'last name must be maximum 40 characters'
    }),
    userName:     joi.string().max(40).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid user name',
        'string.max':'user name must be maximum 40 characters'
    }),
    birthDate:    joi.string().max(40).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid birth date',
        'string.max':'birth date must be maximum 40 characters'
    }),
    mobileNumber:joi.number().integer().min(900000000).max(999999999999).required().messages({
        'number.empty':"please fill all failds",
        'number.integer':"invalid mobile number",
        'number.base':"invalid mobile number",
        'number.max':'mobile number must be maximum 12 digits',
        'number.min':'mobile number must be minimum 9 digits'
    }) ,
    landNumber: joi.number().integer().min(1000000).max(9999999999).required().messages({
        'number.empty':"please fill all failds",
        'number.integer':"invalid land number",
        'number.base':"invalid land number",
        'number.max':'land number must be maximum 10 digits',
        'number.min':'land number must be minimum 7 digits'
    }),
    clinicAddress:joi.string().max(80).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid clinic address',
        'string.max':'clinic address must be maximum 80 characters'
    }),
    image:        joi.string().max(110).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid image',
        'string.max':'image must be maximum 110 characters'
    }),
    password:     joi.string().min(8).max(20).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid password',
        'string.max':'password must be maximum 20 characters',
        'string.min':'password must be minimum 8 characters'
    })
});

const checkWorkTime=joi.object({
    from:joi.number().max(25).required().messages({
        'number.empty':"please fill all failds",
        'number.base':"invalid open time",
        'number.max':'open time must be from 0 h to 24 h'
    }),
    to:joi.number().max(25).required().messages({
        'number.empty':"please fill all failds",
        'number.base':"invalid close time",
        'number.max':'close time must be from 0 h to 24 h'
    })
});

const checkScrtiera=joi.object({
    fName:        joi.string().max(40).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid first name',
        'string.max':'first name must be maximum 40 characters'
    }),
    lName:        joi.string().max(40).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid last name',
        'string.max':'last name must be maximum 40 characters'
    }),
    userName:     joi.string().max(40).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid user name',
        'string.max':'user name must be maximum 40 characters'
    }),
    birthDate:    joi.string().max(40).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid birth date',
        'string.max':'birth date must be maximum 40 characters'
    }),
    mobileNumber:joi.number().integer().min(900000000).max(999999999999).required().messages({
        'number.empty':"please fill all failds",
        'number.integer':"invalid mobile number",
        'number.base':"invalid mobile number",
        'number.max':'mobile number must be maximum 12 digits',
        'number.min':'mobile number must be minimum 9 digits'
    }) ,
    landNumber: joi.number().integer().min(1000000).max(9999999999).required().messages({
        'number.empty':"please fill all failds",
        'number.integer':"invalid land number",
        'number.base':"invalid land number",
        'number.max':'land number must be maximum 10 digits',
        'number.min':'land number must be minimum 7 digits'
    }),
    image:        joi.string().max(110).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid image',
        'string.max':'image must be maximum 110 characters'
    }),
    password:     joi.string().min(8).max(20).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid password',
        'string.max':'password must be maximum 20 characters',
        'string.min':'password must be minimum 8 characters'
    })
});

const checkImage=joi.object({
    image:        joi.string().max(110).required().messages({
        'string.empty':'all failds required',
        'string.base':'invalid image',
        'string.max':'image must be maximum 110 characters'
    })
});

module.exports={
    checkImage,
    checkScrtiera,
    checkWorkTime,
    checkDoctor,
    login,
    checkId,
    checkMeeting,
    checkPatient,
    checkDate
}

/*
messages: {
      'any.custom': [Object],
      'any.default': [Object],
      'any.failover': [Object],
      'any.invalid': [Object],
      'any.only': [Object],
      'any.ref': [Object],
      'any.required': [Object],
      'any.unknown': [Object],
      'string.alphanum': [Object],
      'string.base': [Object],
      'string.base64': [Object],
      'string.creditCard': [Object],
      'string.dataUri': [Object],
      'string.domain': [Object],
      'string.email': [Object],
      'string.empty': [Object],
      'string.guid': [Object],
      'string.hex': [Object],
      'string.hexAlign': [Object],
      'string.hostname': [Object],
      'string.ip': [Object],
      'string.ipVersion': [Object],
      'string.isoDate': [Object],
      'string.isoDuration': [Object],
      'string.length': [Object],
      'string.lowercase': [Object],
      'string.max': [Object],
      'string.min': [Object],
      'string.normalize': [Object],
      'string.token': [Object],
      'string.pattern.base': [Object],
      'string.pattern.name': [Object],
      'string.pattern.invert.base': [Object],
      'string.pattern.invert.name': [Object],
      'string.trim': [Object],
      'string.uri': [Object],
      'string.uriCustomScheme': [Object],
      'string.uriRelativeOnly': [Object],
      'string.uppercase': [Object]
    }
*/