import React, { useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://campus-lost-and-found-kijc.onrender.com";

const ReportItem = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "Other",
    status: "Found",
    contactEmail: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 🤖 Google Cloud Vision AI Integration
  const handleGenerateAiDescription = async () => {
    if (!selectedImage) {
      alert("দয়া করে প্রথমে একটি ছবি সিলেক্ট করুন!");
      return;
    }

    setIsAiLoading(true);
    setMessage("");

    // ইমেজের Blob/File-কে Base64 Data URL-এ রূপান্তর
    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);

    reader.onloadend = async () => {
      const base64ImageUrl = reader.result;

      try {
        // Google Vision এপিআই কল করা (backend-এর /api/vision/analyze-image)
        const response = await fetch(`${API_BASE}/api/vision/analyze-image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: base64ImageUrl }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Vision API থেকে আসা ট্যাগ ও টাইটেল ফর্মের ইনপুটে অটো-ফিল করা
          const tagsString = result.suggestedTags.join(", ");

          setFormData((prev) => ({
            ...prev,
            title: result.suggestedTitle || prev.title,
            description: prev.description
              ? `${prev.description}\n[AI Tags: ${tagsString}]`
              : `সম্ভাব্য অবজেক্ট (AI ট্যাগ): ${tagsString}`,
          }));

          setMessage("✨ Google Cloud Vision AI সফলভাবে ছবি বিশ্লেষণ করেছে!");
        } else {
          alert(result.message || "Vision AI তথ্য সনাক্ত করতে পারেনি।");
        }
      } catch (error) {
        console.error("Vision AI Error:", error);
        alert("সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে!");
      } finally {
        setIsAiLoading(false);
      }
    };
  };

  // Submit Form to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("location", formData.location);
    submitData.append("category", formData.category);
    submitData.append("status", formData.status);
    submitData.append("contactEmail", formData.contactEmail);
    if (selectedImage) {
      submitData.append("image", selectedImage);
    }

    try {
      const response = await fetch(`${API_BASE}/api/items`, {
        method: "POST",
        body: submitData,
      });

      const resData = await response.json();

      if (response.ok) {
        alert("নোটিশ সফলভাবে যুক্ত করা হয়েছে!");
        // Reset Form
        setFormData({
          title: "",
          description: "",
          location: "",
          category: "Other",
          status: "Found",
          contactEmail: "",
        });
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        alert(resData.error || "পাবলিশ করতে সমস্যা হয়েছে।");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("নেটওয়ার্ক সমস্যা!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
      }}
    >
      <h2>হারানো / কুড়িয়ে পাওয়া জিনিসের নোটিশ দিন</h2>

      {message && (
        <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Image Input */}
        <div style={{ marginBottom: "15px" }}>
          <label>ছবি আপলোড করুন:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />

          {imagePreview && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
        </div>

        {/* AI Auto Fill Button */}
        {selectedImage && (
          <button
            type="button"
            onClick={handleGenerateAiDescription}
            disabled={isAiLoading}
            style={{
              backgroundColor: "#166534",
              color: "#fff",
              padding: "10px 15px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "20px",
              width: "100%",
              fontWeight: "bold",
            }}
          >
            {isAiLoading
              ? "🤖 Google Vision AI ছবি প্রসেস করছে..."
              : "✨ Auto Fill with Google Cloud Vision AI"}
          </button>
        )}

        {/* Title */}
        <div style={{ marginBottom: "15px" }}>
          <label>টাইটেল:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="যেমন: একটি কালো চাবির গোছা"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: "15px" }}>
          <label>ক্যাটাগরি:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="Electronics">Electronics</option>
            <option value="Wallet">Wallet</option>
            <option value="ID Card">ID Card</option>
            <option value="Books">Books</option>
            <option value="Keys">Keys</option>
            <option value="Clothing">Clothing</option>
            <option value="Bag">Bag</option>
            <option value="Accessories">Accessories</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Status */}
        <div style={{ marginBottom: "15px" }}>
          <label>স্ট্যাটাস:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="Found">Found (পেয়েছি)</option>
            <option value="Lost">Lost (হারিয়ে গেছে)</option>
          </select>
        </div>

        {/* Location */}
        <div style={{ marginBottom: "15px" }}>
          <label>লোকেশন/স্থান:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="যেমন: লাইব্রেরি, ৩য় তলা"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        {/* Contact Email */}
        <div style={{ marginBottom: "15px" }}>
          <label>যোগাযোগের ইমেইল:</label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: "15px" }}>
          <label>বিবরণ:</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="বিস্তারিত বিবরণ..."
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            backgroundColor: "#2563eb",
            color: "#fff",
            padding: "12px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
            fontSize: "16px",
          }}
        >
          {isSubmitting ? "পাবলিশ হচ্ছে..." : "নোটিশ পোস্ট করুন"}
        </button>
      </form>
    </div>
  );
};

export default ReportItem;
