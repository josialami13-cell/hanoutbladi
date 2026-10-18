"use client";

import Link from "next/link";
import TranslatedText from "@/components/TranslatedText";
import { FiArrowLeft } from "react-icons/fi";

export default function PrivacyPage() {
  return (
    <div className="bg-[#FAF9F5] min-h-screen text-stone-800 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Bouton retour */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#2C3E2D] hover:underline">
            <FiArrowLeft size={14} /> 
            <TranslatedText text="Retour à l'accueil" arText="العودة إلى الرئيسية" />
          </Link>
        </div>

        {/* En-tête */}
        <div className="space-y-3 text-center sm:text-left border-b border-stone-200 pb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
            <TranslatedText text="Protection des Données" arText="حماية البيانات" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            <TranslatedText text="Politique de Confidentialité" arText="سياسة الخصوصية" />
          </h1>
          <p className="text-xs text-stone-500">
            <TranslatedText text="Dernière mise à jour : Septembre 2026" arText="آخر تحديث: سبتمبر 2026" />
          </p>
        </div>

        {/* Contenu de la politique */}
        <div className="space-y-8 text-sm text-stone-600 font-light leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="1. Introduction" arText="1. مقدمة" />
            </h2>
            <p>
              <TranslatedText 
                text="La protection de vos données personnelles est une priorité pour Hanout Bladi et le Domaine Plaza D'Oliviers. La présente Politique de Confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos informations personnelles lorsque vous naviguez sur notre site et passez commande." 
                arText="حماية بياناتك الشخصية هي أولوية بالنسبة لحانوت بلادي وضيعة بلازا أوليفييه. توضح لك سياسة الخصوصية هذه كيف نجمع ونستخدم ونحمي معلوماتك الشخصية عندما تتصفح موقعنا وتقوم بطلبات الشراء." 
              />
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="2. Données Collectées" arText="2. البيانات المُتَعَرف عليها" />
            </h2>
            <p>
              <TranslatedText text="Nous collectons uniquement les informations nécessaires au traitement de vos commandes et à l'amélioration de votre expérience d'achat :" arText="نحن نجمع فقط المعلومات اللازمة لمعالجة طلباتك وتحسين تجربة التسوق الخاصة بك:" />
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><TranslatedText text="Nom et prénom" arText="الاسم الكامل" /></li>
              <li><TranslatedText text="Adresse de livraison et de facturation" arText="عنوان التوصيل والفواتير" /></li>
              <li><TranslatedText text="Numéro de téléphone et adresse email" arText="رقم الهاتف والبريد الإلكتروني" /></li>
              <li><TranslatedText text="Informations de paiement (traitées de manière sécurisée)" arText="معلومات الدفع (يتم معالجتها بطريقة آمنة)" /></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="3. Utilisation des Données" arText="3. استخدام البيانات" />
            </h2>
            <p>
              <TranslatedText text="Les données recueillies auprès de vous sont utilisées pour :" arText="تُستخدم البيانات التي يتم جمعها منك للأغراض التالية:" />
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><TranslatedText text="La gestion, la validation et le suivi de vos commandes." arText="إدارة وتأكيد وتتبع طلباتك." /></li>
              <li><TranslatedText text="L'organisation de la livraison ou du retrait sur place au domaine de Settat." arText="تنظيم التوصيل أو الاستلام من الضيعة بسطات." /></li>
              <li><TranslatedText text="Le service client et la communication relative à vos achats." arText="خدمة العملاء والتواصل المتعلق بمشترياتك." /></li>
              <li><TranslatedText text="L'optimisation du site et la sécurité de notre plateforme." arText="تحسين الموقع وأمان منصتنا." /></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="4. Partage des Données" arText="4. مشاركة البيانات" />
            </h2>
            <p>
              <TranslatedText 
                text="Vos données personnelles sont strictement confidentielles. Elles ne sont ni vendues, ni louées, ni cédées à des tiers, à l'exception de nos prestataires logistiques et de livraison indispensables pour acheminer vos commandes de produits du terroir jusqu'à chez vous." 
                arText="بياناتك الشخصية سرية للغاية. ولا يتم بيعها أو تأجيرها أو نقلها إلى أطراف ثالثة، باستثناء مزودي الخدمات اللوجستية والتوصيل الأساسيين لدينا لتوصيل طلباتك حتى باب منزلك." 
              />
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="5. Sécurité" arText="5. الأمان" />
            </h2>
            <p>
              <TranslatedText 
                text="Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction." 
                arText="نحن طبقنا تدابير أمنية تقنية وتنظيمية مناسبة لحماية بياناتك ضد أي وصول غير مصرح به، أو تعديل، أو إفشاء، أو إتلاف." 
              />
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="6. Vos Droits" arText="6. حقوقك" />
            </h2>
            <p>
              <TranslatedText 
                text="Conformément à la législation en vigueur relative à la protection des données personnelles, vous disposez d'un droit d'accès, de rectification et de suppression des informations vous concernant. Pour exercer ce droit, contactez-nous à l'adresse : contact@hanoutbladi.ma ou par téléphone au +212 6 61 33 77 29." 
                arText="وفقاً للتشريعات المعمول بها بشأن حماية البيانات الشخصية، يحق لك الوصول إلى معلوماتك وتصحيحها وحذفها. لممارسة هذا الحق، اتصل بنا عبر البريد الإلكتروني: contact@hanoutbladi.ma أو الهاتف: 29 77 33 61 6 212+." 
              />
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}