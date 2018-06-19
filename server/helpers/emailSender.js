import aws from 'aws-sdk';
/**
 * Envia email de verificacion de creacion de cuenta de usuario
 */
const sendVerificationEmail = (destination, message) => {
  aws.config.update({ region: 'us-east-1' });
  // load AWS SES
  const ses = new aws.SES({ apiVersion: '2010-12-01', endpoint: 'email.us-east-1.amazonaws.com' });
  // ses.config.update({region: 'us-west-1'});
  const params = {
    Destination: { /* required */
      ToAddresses: [
        destination,
        /* more items */
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
          Data: `Bienvenido a Agrobolt! Tu codigo de verificacion es: ${message}` /* required */
        },
        Text: {
          Data: `Bienvenido a Agrobolt! Tu codigo de verificacion es: ${message}` /* required */
        }
      },
      Subject: { /* required */
        Data: 'Verificacion Agrobolt' /* required */
      }
    },
    Source: 'registro@agrobolt.com',
    /* required */
  };
  ses.sendEmail(params);
};

/**
 * Envia email de invitación de creacion de cuenta de usuario
 */

const sendInviteEmail = (destination, message, meterNumber) => {
  aws.config.update({ region: 'us-east-1' });
  // load AWS SES
  const ses = new aws.SES({ apiVersion: '2010-12-01', endpoint: 'email.us-east-1.amazonaws.com' });
  // ses.config.update({region: 'us-west-1'});
  const params = {
    Destination: { /* required */
      ToAddresses: [
        destination,
        /* more items */
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
          Data: `Bienvenido a Agrobolt! Has sido invitado a monitorear el medidor: ${meterNumber}.\n` +
            'Si no estas registrado, para empezar a observar el monitoreo en tiempo real, basta con descargar Agrobolt del AppStore, Google Play' +
            ' o en la web agrobolt.com y registrarte con este mismo correo! Puedes ocupar tus cuentas de Facebook y Google' +
            ' mientras tengan este mismo correo asociado' /* required */
        },
        Text: {
          Data: `Bienvenido a Agrobolt! Has sido invitado a monitorear el medidor: ${meterNumber}.\n` +
            'Si no estas registrado, para empezar a observar el monitoreo en tiempo real, basta con descargar Agrobolt del AppStore, Google Play' +
            ' o en la web agrobolt.com y registrarte con este mismo correo! Puedes ocupar tus cuentas de Facebook y Google' +
            ' mientras tengan este mismo correo asociado'
        }
      },
      Subject: { /* required */
        Data: 'Invitacion a Agrobolt' /* required */
      }
    },
    Source: 'registro@agrobolt.com',
    /* required */
  };
  ses.sendEmail(params);
};

/**
 * Envia email con enlace de reinicio de password
 */
const sendPasswordResetEmail = (destination, token) => {
  aws.config.update({ region: 'us-east-1' });
  // load AWS SES
  const ses = new aws.SES({ apiVersion: '2010-12-01', endpoint: 'email.us-east-1.amazonaws.com' });
  // ses.config.update({region: 'us-west-1'});
  const params = {
    Destination: { /* required */
      ToAddresses: [
        destination,
        /* more items */
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
          Data: `El enlace para reiniciar tu password es: ${token}` /* required */
        },
        Text: {
          Data: `El enlace para reiniciar tu password es: ${token}` /* required */
        }
      },
      Subject: { /* required */
        Data: 'Reinicio password Agrobolt' /* required */
      }
    },
    Source: 'registro@agrobolt.com',
    /* required */
  };
  ses.sendEmail(params);
};

/**
 * Envia email de confirmación de cambio de clave
 */
const sendConfirmationChangePassword = (destination) => {
  aws.config.update({ region: 'us-east-1' });
  // load AWS SES
  const ses = new aws.SES({ apiVersion: '2010-12-01', endpoint: 'email.us-east-1.amazonaws.com' });
  // ses.config.update({region: 'us-west-1'});
  const params = {
    Destination: { /* required */
      ToAddresses: [
        destination,
        /* more items */
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
          Data: `Se ha cambiado la contraseña con exito para la cuenta ${destination}` /* required */
        },
        Text: {
          Data: `Se ha cambiado la contraseña con exito para la cuenta ${destination}` /* required */
        }
      },
      Subject: { /* required */
        Data: 'Cambio de contraseña de Agrobolt' /* required */
      }
    },
    Source: 'registro@agrobolt.com',
    /* required */
  };
  ses.sendEmail(params);
};

module.exports.sendVerificationEmail = sendVerificationEmail;
module.exports.sendInviteEmail = sendInviteEmail;
module.exports.sendPasswordResetEmail = sendPasswordResetEmail;
module.exports.sendConfirmationChangePassword = sendConfirmationChangePassword;
