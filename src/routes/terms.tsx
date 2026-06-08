import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — Almwanaa" }] }),
  component: TermsPage,
});

function TermsPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  return (
    <Layout>
      <article
        dir={isAr ? "rtl" : "ltr"}
        className={`container mx-auto px-5 py-6 max-w-3xl leading-8 whitespace-pre-line ${isAr ? "text-right" : "text-left"}`}
      >
        {isAr ? <ArabicTerms /> : <EnglishTerms />}
      </article>
    </Layout>
  );
}

function ArabicTerms() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">الشروط والأحكام</h1>
      <p className="text-sm text-muted-foreground mb-6">شركة الموانئ للشحن والتسويق الدولي (Almwanaa Company)</p>

      <p>يرجى قراءة هذه الشروط بعناية قبل استخدام التطبيق.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. قبول الشروط</h2>
      <p>باستخدام التطبيق فإنك توافق على جميع الشروط والأحكام الواردة في هذه الصفحة.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. استخدام التطبيق</h2>
      <p>يُستخدم التطبيق لإدارة وتتبع الشحنات والخدمات المرتبطة بها فقط.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. مسؤولية المستخدم</h2>
      <p>يتحمل المستخدم مسؤولية:</p>
      <ul className="list-disc pe-5 space-y-1">
        <li>صحة المعلومات التي يقوم بإدخالها.</li>
        <li>الحفاظ على سرية بيانات تسجيل الدخول الخاصة به.</li>
        <li>عدم مشاركة حسابه مع الآخرين.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. الحسابات</h2>
      <p>يحق للإدارة تعليق أو حذف أي حساب عند إساءة الاستخدام أو مخالفة القوانين أو الشروط.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. معلومات الشحنات</h2>
      <p>تبذل شركة الموانئ أقصى جهد لتوفير معلومات دقيقة ومحدثة، إلا أن بعض التحديثات قد تتأخر لأسباب تشغيلية أو لوجستية.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. الإشعارات</h2>
      <p>قد يتلقى المستخدم إشعارات تتعلق بالشحنات أو الخدمات أو التحديثات المهمة داخل التطبيق.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">7. إخلاء المسؤولية</h2>
      <p>لا تتحمل شركة الموانئ المسؤولية عن أي أضرار ناتجة عن:</p>
      <ul className="list-disc pe-5 space-y-1">
        <li>إدخال بيانات غير صحيحة.</li>
        <li>استخدام غير صحيح للتطبيق.</li>
        <li>ظروف خارجة عن الإرادة تؤثر على عمليات الشحن أو التسليم.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">8. التعديلات</h2>
      <p>يحق لشركة الموانئ تعديل هذه الشروط والأحكام في أي وقت، ويعتبر استمرار استخدام التطبيق موافقة على التعديلات الجديدة.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">9. التواصل</h2>
      <p>في حال وجود أي استفسار أو مشكلة يمكن التواصل مع إدارة شركة الموانئ من خلال وسائل التواصل الرسمية المعتمدة.</p>

      <p className="mt-6 font-medium">باستخدام التطبيق فإنك تقر بموافقتك على جميع الشروط والأحكام المذكورة أعلاه.</p>
    </>
  );
}

function EnglishTerms() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Terms &amp; Conditions</h1>
      <p className="text-sm text-muted-foreground mb-6">Almwanaa Company for Shipping and International Marketing</p>

      <p>Please read these terms carefully before using the application.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
      <p>By using the application, you agree to all the terms and conditions contained on this page.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. Use of the Application</h2>
      <p>The application is used solely to manage and track shipments and related services.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. User Responsibility</h2>
      <p>The user is responsible for:</p>
      <ul className="list-disc ps-5 space-y-1">
        <li>The accuracy of the information they enter.</li>
        <li>Maintaining the confidentiality of their login credentials.</li>
        <li>Not sharing their account with others.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. Accounts</h2>
      <p>The administration reserves the right to suspend or delete any account in case of misuse or violation of laws or terms.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. Shipment Information</h2>
      <p>Almwanaa makes every effort to provide accurate and up-to-date information; however, some updates may be delayed for operational or logistical reasons.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. Notifications</h2>
      <p>The user may receive notifications regarding shipments, services, or important updates within the application.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">7. Disclaimer of Liability</h2>
      <p>Almwanaa is not responsible for any damages resulting from:</p>
      <ul className="list-disc ps-5 space-y-1">
        <li>Entering incorrect data.</li>
        <li>Improper use of the application.</li>
        <li>Circumstances beyond control affecting shipping or delivery operations.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">8. Changes</h2>
      <p>Almwanaa reserves the right to modify these terms and conditions at any time, and continued use of the application is considered acceptance of the new modifications.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">9. Contact</h2>
      <p>For any inquiries or issues, you can contact the management of Almwanaa through the official approved communication channels.</p>

      <p className="mt-6 font-medium">By using the application, you acknowledge your acceptance of all the terms and conditions mentioned above.</p>
    </>
  );
}
