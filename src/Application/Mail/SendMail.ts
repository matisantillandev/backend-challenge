import { inject, injectable } from "inversify";
import * as nodemailer from 'nodemailer'
import TYPES from '@src/TYPES';
import Responseable from "@src/Domain/Entities/Util/Ports/Responseable";
import SendeableMail from './Ports/SendeableMail';


import { google } from 'googleapis'
import { oauth2 } from "googleapis/build/src/apis/oauth2";

@injectable()
export default class SendMail implements SendeableMail {

  @inject(TYPES.ResponseableDomain) private responserService: Responseable
  public async sendMail(
    to: string, 
    text: string, 
    from: string, 
    pass: string, 
    subject: string
  ): Promise<Responseable> {
    let error: boolean = false
    let errorMessage: string = ''

    if(!error){
      const sendMailResponse = await this.send(from, pass, to, subject, text)
      if(typeof(sendMailResponse) === 'string' && sendMailResponse !== undefined){
        const messageResponse = `Se envió un correo a ${to}. Si no lo encuentras, asegurate de revisar tu spam.`
        return this.responserService = {
          result: [],
          message: messageResponse,
          error: '',
          status: 200
        }
      } else {
        return this.responserService = {
          result: sendMailResponse,
          message: 'No se pudo enviar el email. Por favor, intentá de nuevo más tarde.',
          error: '',
          status: 500
        }
      }
    } else{ 
      return this.responserService = {
        result: [],
        message: 'No se pudo enviar el email. Por favor, intentá de nuevo más tarde.',
        error: '',
        status: 500
      }
    }
  }


  public async send(
    from: string,
    pass: string,
    to: string,
    subject: string,
    text: string
  ) {  

    return new Promise<Responseable>( async (resolve, reject) => {
       //gmail config
      /* const oAuthGoogle = google.auth.OAuth2
      const oAuthGoogleClient = new oAuthGoogle(
        "25777294883-qv4h6sv4hqhnbln940iibfmdmhit9k71.apps.googleusercontent.com",
        "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",
        "https://developers.google.com/oauthplayground"
      )


      oAuthGoogleClient.setCredentials({
        refresh_token: "1//04Vu7Mmc5uJ60CgYIARAAGAQSNwF-L9IrwnCizkf2bqHmPp-8SjDSRqSX2W1QpRXwZ-kF82uGb2fo2SEIU_1vS9S9nLcdRqm0FH0"
      })

      const accessToken = oAuthGoogleClient.getAccessToken()  */
    
      //nodemailer config
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          /* type: "OAuth2", */
          user: from, 
          pass
          /* clientId: "Your ClientID Here",
          clientSecret: "Your Client Secret Here",
          refreshToken: "Your Refresh Token Here",
          accessToken: accessToken */
        }
      })
  
      try {
        transporter.verify(async function(error, success) {
          if (success) {
            await transporter.sendMail({
                from: from,
                to: to,
                subject: subject,
                text: text,
                html: text
              }).then((info: any) => {

                if (info !== undefined) {
                  // console.log("Message %s send", info.messageId);
                  resolve(info.messageId);
                }

              }).catch((err) => {
                // console.log(err.toString())
                reject(err);
              });
          } else {
            // console.log(error.toString())
            reject(error);
          }
        });
      } catch (err) {
        // console.log(err.toString())
        reject(err);
      }
    });

  }
}