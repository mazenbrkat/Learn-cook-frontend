import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import toast from "react-hot-toast";

function GoogleLoginButton({ setUser }) {
  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          const res = await axios.post(
            "http://localhost:5000/api/auth/google",
            {
              token: credentialResponse.credential,
            }
          );

          // 💾 حفظ البيانات
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));

          setUser(res.data.user);

          toast.success("تم تسجيل الدخول 🎉");
        } catch (err) {
          console.error(err);
          toast.error("فشل تسجيل الدخول");
        }
      }}
      onError={() => toast.error("Google login error")}
    />
  );
}

export default GoogleLoginButton;