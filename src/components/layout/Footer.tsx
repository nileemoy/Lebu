import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield size={20} />
            <span className="text-lg font-semibold">VigilAi</span>
          </div>
          
          <div className="text-sm text-gray-400">
            Fighting misinformation and deepfakes one click at a time
          </div>
          
          <div className="mt-4 md:mt-0 text-sm">
            &copy; {new Date().getFullYear()} VigilAi
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;