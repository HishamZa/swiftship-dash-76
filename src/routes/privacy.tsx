import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Almwanaa" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  return (
    <Layout>
      <article
        dir={isAr ? "rtl" : "ltr"}
        className={`container mx-auto px-5 py-6 max-w-3xl leading-8 whitespace-pre-line ${isAr ? "text-right" : "text-left"}`}
      >
        {isAr ? <ArabicPrivacy /> : <EnglishPrivacy />}
      </article>
    </Layout>
  );
}

function ArabicPrivacy() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">سياسة الخصوصية</h1>
      <p className="text-sm text-muted-foreground mb-6">شركة الموانئ للشحن والتسويق الدولي (Almwanaa Company)</p>

      <p>نحن في شركة الموانئ نلتزم بحماية خصوصية مستخدمي التطبيق والحفاظ على سرية بياناتهم.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. المعلومات التي نقوم بجمعها</h2>
      <p>قد نقوم بجمع المعلومات التالية:</p>
      <ul className="list-disc pe-5 space-y-1">
        <li>الاسم.</li>
        <li>رقم الهاتف.</li>
        <li>العنوان.</li>
        <li>معلومات الشحنات.</li>
        <li>بيانات تسجيل الدخول.</li>
        <li>الإشعارات المتعلقة بالشحنات.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. استخدام المعلومات</h2>
      <p>يتم استخدام المعلومات للأغراض التالية:</p>
      <ul className="list-disc pe-5 space-y-1">
        <li>إنشاء وإدارة حساب المستخدم.</li>
        <li>تتبع الشحنات وإظهار حالتها.</li>
        <li>التواصل مع العملاء.</li>
        <li>إرسال الإشعارات المتعلقة بالشحنات والتحديثات.</li>
        <li>تحسين جودة الخدمات المقدمة.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. حماية البيانات</h2>
      <p>نلتزم باتخاذ الإجراءات التقنية المناسبة لحماية بيانات المستخدمين من الوصول غير المصرح به أو التعديل أو الحذف.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. مشاركة المعلومات</h2>
      <p>لا نقوم ببيع أو تأجير أو مشاركة البيانات الشخصية مع أي طرف ثالث إلا عند الضرورة لتقديم الخدمة أو عند وجود متطلبات قانونية.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. الإشعارات</h2>
      <p>قد يقوم التطبيق بإرسال إشعارات تتعلق بحالة الشحنات أو التحديثات المهمة الخاصة بالخدمة.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. حقوق المستخدم</h2>
      <p>يحق للمستخدم:</p>
      <ul className="list-disc pe-5 space-y-1">
        <li>تعديل بياناته الشخصية.</li>
        <li>تغيير كلمة المرور الخاصة به.</li>
        <li>طلب حذف حسابه من خلال التواصل مع الإدارة.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">7. التعديلات</h2>
      <p>تحتفظ شركة الموانئ بحق تعديل سياسة الخصوصية في أي وقت، ويتم نشر النسخة المحدثة داخل التطبيق.</p>

      <p className="mt-6 font-medium">باستخدام التطبيق فإنك توافق على سياسة الخصوصية المذكورة أعلاه.</p>
    </>
  );
}

function EnglishPrivacy() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-6">Almwanaa Company for Shipping and International Marketing</p>

      <p>At Almwanaa, we are committed to protecting the privacy of our application users and keeping their data confidential.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p>We may collect the following information:</p>
      <ul className="list-disc ps-5 space-y-1">
        <li>Name.</li>
        <li>Phone number.</li>
        <li>Address.</li>
        <li>Shipment information.</li>
        <li>Login data.</li>
        <li>Shipment-related notifications.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. Use of Information</h2>
      <p>Information is used for the following purposes:</p>
      <ul className="list-disc ps-5 space-y-1">
        <li>Creating and managing user accounts.</li>
        <li>Tracking shipments and displaying their status.</li>
        <li>Communicating with customers.</li>
        <li>Sending notifications about shipments and updates.</li>
        <li>Improving the quality of services provided.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. Data Protection</h2>
      <p>We are committed to taking appropriate technical measures to protect user data from unauthorized access, modification, or deletion.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. Sharing Information</h2>
      <p>We do not sell, rent, or share personal data with any third party except when necessary to provide the service or when legally required.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. Notifications</h2>
      <p>The application may send notifications related to shipment status or important service updates.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. User Rights</h2>
      <p>The user has the right to:</p>
      <ul className="list-disc ps-5 space-y-1">
        <li>Edit their personal data.</li>
        <li>Change their password.</li>
        <li>Request deletion of their account by contacting the administration.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">7. Changes</h2>
      <p>Almwanaa reserves the right to modify the privacy policy at any time, and the updated version will be published within the application.</p>

      <p className="mt-6 font-medium">By using the application, you agree to the privacy policy stated above.</p>
    </>
  );
}
