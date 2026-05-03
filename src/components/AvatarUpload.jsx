import axios from "axios";

function AvatarUpload() {
  const handleUpload = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    const res = await axios.post(
      "http://localhost:5000/api/upload",
      formData
    );

    console.log(res.data.image);
  };

  return <input type="file" onChange={handleUpload} />;
}

export default AvatarUpload;