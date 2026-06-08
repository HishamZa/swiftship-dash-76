import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "الشروط والأحكام — Almwanaa" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <Layout>
      <article dir="rtl" className="container mx-auto px-5 py-6 max-w-3xl text-right leading-8 whitespace-pre-line">
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
      </article>
    </Layout>
  );
}
