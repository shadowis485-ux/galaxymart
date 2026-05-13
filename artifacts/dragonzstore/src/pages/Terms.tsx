import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const sections = [
  { title: '1. Acceptance of Terms', content: 'By accessing and using DragonzStore, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.' },
  { title: '2. Digital Products', content: 'All products sold on DragonzStore are digital goods. Upon successful payment confirmation, products are delivered instantly to your provided email address. All sales are final due to the digital nature of our products.' },
  { title: '3. Payment & Cryptocurrency', content: 'DragonzStore accepts Litecoin (LTC) as payment. Prices displayed in USD are converted to LTC at the current market rate. Payments are processed through NOWPayments, a trusted cryptocurrency payment gateway.' },
  { title: '4. Delivery Policy', content: 'Digital products are delivered automatically to your email address after payment confirmation. Delivery typically occurs within 5 minutes of payment confirmation. If you do not receive your order, please contact support with your order ID.' },
  { title: '5. Refund Policy', content: 'Due to the digital nature of our products, we do not offer refunds once a product has been delivered. If you experience issues with a product, please contact our support team within 24 hours of purchase.' },
  { title: '6. Account Usage', content: 'All accounts and licenses sold are for personal use only. Reselling, sharing, or distributing purchased digital products is strictly prohibited. Violation may result in permanent bans from our store.' },
  { title: '7. Privacy & Security', content: 'We collect minimal data to process your orders. We store your email address and order information to facilitate delivery. Your payment information is handled entirely by NOWPayments and we never store cryptocurrency wallet information.' },
  { title: '8. Limitation of Liability', content: 'DragonzStore is not responsible for any damages arising from the use of purchased products. Our liability is limited to the purchase price of the product in question.' },
  { title: '9. Changes to Terms', content: 'We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.' },
];

export default function Terms() {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-display font-bold text-white mb-3">Terms of <span className="gold-text">Service</span></h1>
          <p className="text-gray-500 text-sm">Last updated: January 2024</p>
        </motion.div>
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-6">
              <h3 className="text-neon-500 font-semibold text-base mb-3">{section.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 glass-card p-6 text-center">
          <p className="text-gray-400 text-sm">
            Questions about our terms? Contact us at{' '}
            <a href="mailto:support@dragonzstore.com" className="text-neon-500 hover:text-neon-400 transition-colors">support@dragonzstore.com</a>
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
