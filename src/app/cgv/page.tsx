"use client";

import Link from "next/link";
import TranslatedText from "@/components/TranslatedText";
import { FiArrowLeft } from "react-icons/fi";

export default function CGVPage() {
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
            <TranslatedText text="Cadre Légal" arText="الإطار القانوني" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            <TranslatedText text="Conditions Générales de Vente (CGV)" arText="الشروط العامة للبيع (CGV)" />
          </h1>
          <p className="text-xs text-stone-500">
            <TranslatedText text="Dernière mise à jour : Septembre 2026" arText="آخر تحديث: سبتمبر 2026" />
          </p>
        </div>

        {/* Contenu des CGV */}
        <div className="space-y-8 text-sm text-stone-600 font-light leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="Article 1 : Objet" arText="المادة 1: الموضوع" />
            </h2>
            <p>
              <TranslatedText 
                text="Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits et de services du terroir proposées sur la plateforme en ligne Hanout Bladi, vitrine e-commerce du Domaine Plaza D'Oliviers, situé à Mzamza Janoubia, Settat, Maroc. Toute commande validée sur le site implique l'adhésion entière et sans réserve du client aux présentes CGV." 
                arText="تخضع الشروط العامة للبيع هذه لبيع المنتجات والخدمات المحلية المعروضة على منصة حانوت بلادي الإلكترونية، واجهة التجارة الإلكترونية لضيعة بلازا أوليفييه، الكائنة بمزامزة الجنوبية، سطات، المغرب. أي طلب مؤكد على الموقع يعني موافقة العميل الكاملة ودون تحفظ على هذه الشروط." 
              />
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="Article 2 : Produits et Disponibilité" arText="المادة 2: المنتجات والتوفر" />
            </h2>
            <p>
              <TranslatedText 
                text="Nos produits (huiles d'olive vierges extra Picholine, Menara et Débia, miel pur de fleurs, olives de table et amlou artisanal) sont issus de notre exploitation agricole à Settat. Les offres de produits sont valables tant qu'elles sont visibles sur le site et dans la limite des stocks disponibles." 
                arText="منتجاتنا (زيوت الزيتون البكر الممتازة بيشولين، المنارة وديبيا، عسل الزهور النقي، زيتون المائدة، والأملو التقليدي) مستمدة من ضيعتنا الفلاحية بسطات. عروض المنتجات سارية طالما كانت ظاهرة على الموقع وفي حدود المخزون المتاح." 
              />
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="Article 3 : Prix" arText="المادة 3: الأسعار" />
            </h2>
            <p>
              <TranslatedText 
                text="Les prix de nos produits sont indiqués en Dirhams Marocains (MAD) toutes taxes comprises (TTC). Le Domaine Plaza D'Oliviers se réserve le droit de modifier ses prix à tout moment, mais les produits facturés le seront sur la base des tarifs en vigueur au moment de la validation de la commande." 
                arText="تُعرَف أسعار منتجاتنا بالدرهم المغربي (MAD) شاملة جميع الرسوم. تحتفظ ضيعة بلازا أوليفييه بالحق في تعديل أسعارها في أي وقت، ولكن سيتم فوترة المنتجات بناءً على الأسعار المعمول بها وقت تأكيد الطلب." 
              />
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="Article 4 : Commandes et Validation" arText="المادة 4: الطلبات والتأكيد" />
            </h2>
            <p>
              <TranslatedText 
                text="Le client passe commande sur le site internet hanoutbladi.ma. La validation de la commande entraîne l'acceptation des prix et descriptions des produits disponibles à l'achat. Un récapitulatif de commande est envoyé par email ou via les coordonnées communiquées." 
                arText="يقوم العميل بتقديم الطلب عبر الموقع الإلكتروني. يؤدي تأكيد الطلب إلى قبول الأسعار ووصف المنتجات المتاحة للشراء. يتم إرسال ملخص الطلب عبر البريد الإلكتروني أو وسائل الاتصال المقدمة." 
              />
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="Article 5 : Modalités de Paiement" arText="المادة 5: طرق الدفع" />
            </h2>
            <p>
              <TranslatedText text="Le règlement des achats s'effectue selon les modes proposés sur le site :" arText="يتم سداد المشتريات وفقاً للطرق المقترحة على الموقع:" />
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><TranslatedText text="Paiement à la livraison (Espèces)." arText="الدفع عند الاستلام (نقداً)." /></li>
              <li><TranslatedText text="Carte bancaire (via passerelle sécurisée)." arText="البطاقة البنكية (عبر بوابة آمنة)." /></li>
              <li><TranslatedText text="Virement bancaire ou transfert via CashPlus." arText="تحويل بنكي أو عبر خدمة كاش بلس." /></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="Article 6 : Livraison et Retrait sur Place" arText="المادة 6: التوصيل والاستلام من الضيعة" />
            </h2>
            <p>
              <TranslatedText 
                text="Les livraisons sont effectuées à l'adresse indiquée par le client au Maroc. Le client a également la possibilité de choisir l'option de retrait gratuit directement sur place au Domaine Plaza D'Oliviers (Settat). Les délais de livraison sont donnés à titre indicatif." 
                arText="يتم التوصيل إلى العنوان الذي يحدده العميل في المغرب. للعميل أيضاً خيار الاستلام المجاني مباشرة من ضيعة بلازا أوليفييه (سطات). أوقات التوصيل تعتبر تقريبية." 
              />
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              <TranslatedText text="Article 7 : Contact" arText="المادة 7: الاتصال" />
            </h2>
            <p>
              <TranslatedText 
                text="Pour toute question relative aux présentes conditions, vous pouvez nous joindre par téléphone au +212 6 61 33 77 29 ou par email à contact@hanoutbladi.ma." 
                arText="لأي استفسار بخصوص هذه الشروط، يمكنك الاتصال بنا عبر الهاتـف: 29 77 33 61 6 212+ أو عبر البريد الإلكتروني: contact@hanoutbladi.ma." 
              />
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}