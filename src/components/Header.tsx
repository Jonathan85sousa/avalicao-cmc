
import { useState } from 'react';
import { Upload, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Header = () => {
  const [logoUrl, setLogoUrl] = useState<string>('');

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-12 w-auto object-contain rounded-lg shadow-md"
              />
            ) : (
              <div className="flex items-center space-x-2 text-blue-600">
                <Mountain className="h-8 w-8" />
                <span className="text-xl font-bold">Aventura Pro</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <label htmlFor="logo-upload">
              <Button 
                variant="outline" 
                size="sm" 
                className="cursor-pointer hover:bg-blue-50"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {logoUrl ? 'Alterar Logo' : 'Upload Logo'}
                </span>
              </Button>
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
