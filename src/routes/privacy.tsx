import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "سياسة الخصوصية — Almwanaa" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <Layout>
      <article dir="rtl" className="container mx-auto px-5 py-6 max-w-3xl text-right leading-8 whitespace-pre-line">
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
      </article>
    </Layout>
  );
}
