import  mailchimp from '@mailchimp/mailchimp_transactional'

const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANS_KEY);

export async function sendEmailTest(from) {
  try {
    const response = await mailchimpClient.messages.send({
      message: {
        from_email: "syamashiro@iolani.org",
        from_name: "TEST FROM",
        subject: "Test EMAIL",
        text: "This is a test email sent with Mailchimp Transactional.",
        html: `
          <h1>Hello!</h1>
          <p>This is a test email sent with Mailchimp Transactional.</p>
        `,
        to: [
          {
            email: "syamashiro@iolani.org",
            name: "Steven",
            type: "to",
          },
        ],
      },
    });

    console.log("Email sent:", response);
    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export const sendEmail = async ({to,from,subject,text,html,}) => {
  if (!to || !subject) {
    throw new Error("to and subject are required");
  }

  return mailchimpClient.messages.send({
    message: {
      from_email: from, // "syamashiro@iolani.org",
    //   from_name: "TEST",
      to: [
        {
          email: to,
          type: "to",
        },
      ],
      subject,
      text,
      html,
    },
  });

  // return values "sent" "queued" "scheduled" "rejected" "invalid"
}

export const newPassEmailTemplate=(passId,report_to,on_date,at_period,duration,requestor,extraNotes)=>{
    return `
    <h2>Pass #${passId}</h2>
    <p>A new pass has been created for you.</p>
    <p>Please report to ${report_to} on ${on_date} at period ${at_period}${(duration==='A'?'':' from '+ duration)}.</p>
    <p  style="color: #ff0000;">${extraNotes}</p>
    <p>Please contact ${requestor} if you have any questions.</p>
            `
}

export const updatedPassEmailTemplate=(passId,report_to,on_date,at_period,duration,requestor)=>{
    return `
    <h2>Pass #${passId}</h2>
    <p>pass #${passId} has been update.</p>
    <p>Please report to ${report_to} on ${on_date} at period ${at_period}${(duration==='A'?'. ':' from '+ duration)}.</p>
    <p>Please contact ${requestor} if you have any questions.</p>
            `
}