import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function Login() {
  return (
    <GoogleLogin
      onSuccess={async (res) => {
        const data = await axios.post(
          "http://localhost:5000/api/auth/google",
          { token: res.credential }
        );

        localStorage.setItem("token", data.data.token);
      }}
    />
  );
}

export default Login;