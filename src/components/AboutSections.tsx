

export const AboutSection = () => {
    return (
        <div className="container mx-auto py-16">
            <div className="mx-auto text-center space-y-4">
                {/* Heading */}
                <h2 className="text-[42px] font-bold text-[#000000]">
                    About Us
                </h2>

                {/* Welcome Text */}
                <p className="text-[16px] text-[#000000]">
                    Welcome to FF Esports, India's rising platform for online e-sports tournaments.
                </p>

                {/* Description */}
                <p className="text-[16px] text-[#000000]">
                    Whether you're a casual gamer or a competitive beast, we provide a seamless booking system for Free Fire and BGMI tournaments with real cash prizes.
                </p>

                {/* Goal */}
                <div className="mb-12">
                    <h3 className="text-xl font-semibold text-[#000000] mb-4">
                        OUR GOAL:
                    </h3>
                    <p className="text-[16px] text-[#000000]">
                        To build a vibrant gaming community where skills are rewarded, fair play is respected, and every match counts.
                    </p>
                </div>

                {/* CTA Button */}
                <div className="flex justify-center">
                    <button
                        className="w-[191px] h-[43px] rounded-[8px] bg-[#000000] text-white text-[13px] flex items-center justify-center uppercase tracking-wider">
                        KNOW MORE ALPHA
                    </button>
                </div>
            </div>
        </div>
    );
};