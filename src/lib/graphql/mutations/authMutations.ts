import { gql } from "../../../generated/gql";

export const SIGNUP_MUTATION = gql(`
  mutation CreateUser($username: String!, $email: String!, $password: String!) {
    createUser(data: { username: $username, email: $email, password: $password }) {
      id
      username
      email
    }
  }
`);

export const VERIFY_EMAIL_OTP_MUTATION = gql(`
  mutation VerifyEmailOtp($code: String!) {
    verifyEmailOtp(code: $code)
  }
`);

export const RESEND_OTP_MUTATION = gql(`
  mutation ResendVerificationOtp($email: String!) {
    resendVerificationOtp(email: $email)
  }
`);

export const LOGOUT_MUTATION = gql(`
  mutation Logout {
    logout
  }
`);


export const LOGIN_MUTATION = gql(`
  mutation Login($data: LoginInput!) {
    login(data: $data) {
      status
      user {
        id
        username
        email
        emailVerified
      }
    }
  }
`);


// export const LOGIN_MUTATION = gql`
//   mutation LoginUser($email: String!, $password: String!) {
//     Login(data: { email: $email, password: $password }) {
//       status
//       user {
//         id
//         username
//       }
//     }
//   }
// `;