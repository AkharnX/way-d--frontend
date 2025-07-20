import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Users, Star } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <img 
                src="/logo-name-blue.png" 
                alt="Way-d - Rencontre sur ta voie" 
                className="h-24 w-auto drop-shadow-2xl bg-white rounded-xl p-4"
              />
            </div>
            
            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Trouve ton
              <span className="text-blue-300 block">chemin vers l'amour</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Rencontres authentiques basées sur vos passions et votre localisation
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="bg-white text-blue-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Commencer l'aventure
              </Link>
              
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-900 transform hover:scale-105 transition-all duration-200"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Way-d ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une approche différente des rencontres, centrée sur l'authenticité et la proximité
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Proximité</h3>
              <p className="text-gray-600">
                Rencontrez des personnes près de chez vous qui partagent vos intérêts
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Communauté</h3>
              <p className="text-gray-600">
                Rejoignez une communauté bienveillante de célibataires authentiques
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Qualité</h3>
              <p className="text-gray-600">
                Des profils vérifiés pour des rencontres de qualité en toute sécurité
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="py-16 bg-blue-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à commencer votre histoire ?
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Rejoignez des milliers de célibataires qui ont trouvé leur chemin
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg inline-flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Créer mon profil gratuitement
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
