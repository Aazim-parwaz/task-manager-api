const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  
  const welcomeEmailNote= (email,name)=>{
    const msg = {
        to: email,
        from: 'codeparwaz@gmail.com',
        subject: 'Thanks for joining in!',
        text: `welcome to our services ${name}.Please feel free to use our services`,
        html: '<h1>Bismillah Diagnostic center Welcomes you with a warm heart! 🙂</h1>',
      };
      sgMail.send(msg)
  }
  const cancellationEmailNote=(email,name)=>{
      const msg={
        to: email,
        from: 'codeparwaz@gmail.com',
        subject: 'Thanks for being with us!',
        text: `${name}! sorry for any inconvience! do write your feedback so that we could make you our customer once again.`,
        html: '<h1>Bismillah Diagnostic center bids a happy future! 🙂</h1>',
      }
      sgMail.send(msg)
  }
  module.exports={
      welcomeEmailNote,
      cancellationEmailNote,
  }