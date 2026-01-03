import { Background } from '@/components/layout/Background';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Smartphone, Monitor, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DownloadPage() {
  const navigate = useNavigate();

  const apps = [
    {
      platform: 'Android',
      icon: Smartphone,
      description: 'Download Tatakai for Android devices',
      version: 'Coming Soon',
      features: [
        'Offline downloads',
        'Push notifications',
        'Optimized mobile experience',
        'Picture-in-picture mode'
      ],
      available: false,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      platform: 'Windows',
      icon: Monitor,
      description: 'Download Tatakai for Windows PC',
      version: 'Coming Soon',
      features: [
        'Desktop notifications',
        'Keyboard shortcuts',
        'Hardware acceleration',
        'Multi-window support'
      ],
      available: false,
      gradient: 'from-blue-500 to-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Background />
      <Sidebar />

      <main className="relative z-10 pl-6 md:pl-32 pr-6 py-6 max-w-[1400px] mx-auto pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Download className="w-10 h-10 text-primary" />
            <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Download Tatakai
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Take your anime experience with you. Native apps for Android and Windows are coming soon!
          </p>
        </div>

        {/* Apps Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {apps.map((app) => (
            <GlassPanel key={app.platform} className="p-8 hover:scale-[1.02] transition-transform">
              {/* Platform Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${app.gradient} shadow-lg`}>
                    <app.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">{app.platform}</h2>
                    <p className="text-muted-foreground text-sm">{app.description}</p>
                  </div>
                </div>
              </div>

              {/* Version Badge */}
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-sm font-medium">
                  {app.version}
                </span>
              </div>

              {/* Features List */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                  Features
                </h3>
                <ul className="space-y-2">
                  {app.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Download Button */}
              <Button
                disabled={!app.available}
                className="w-full"
                size="lg"
              >
                {app.available ? (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download for {app.platform}
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 mr-2" />
                    Coming Soon
                  </>
                )}
              </Button>
            </GlassPanel>
          ))}
        </div>

        {/* Additional Info */}
        <GlassPanel className="p-8 text-center">
          <h3 className="font-display text-xl font-bold mb-3">Stay Updated</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to know when our native apps are ready for download. Follow us on social media or check back here for updates!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              🚀 In Development
            </div>
            <div className="px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              📱 Mobile First
            </div>
            <div className="px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              💻 Desktop Optimized
            </div>
          </div>
        </GlassPanel>
      </main>

      <MobileNav />
    </div>
  );
}
