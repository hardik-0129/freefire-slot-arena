import { MessageCircle } from "lucide-react";
import "./css/FloatingWhatsApp.css";

const FloatingWhatsApp = () => {
    const handleWhatsAppClick = () => {
        // Your WhatsApp number
        const whatsappNumber = "919426514470"; // +91 94265 14470
        const message = "Hello! I'm interested in Alpha Lions E-Tournament. Can you help me?";
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="floating-whatsapp-container">
            <button
                className="floating-whatsapp-button"
                onClick={handleWhatsAppClick}
                title="Contact us on WhatsApp"
            >
                <MessageCircle className="whatsapp-icon" />
            </button>
        </div>
    );
};

export default FloatingWhatsApp;
