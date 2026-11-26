import UIKit
import AVFoundation
import Capacitor

@objc(IosAudioTogglePlugin)
public class IosAudioTogglePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AudioTogglePlugin"
    public let jsName = "AudioToggle"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setSpeakerOn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reset", returnType: CAPPluginReturnPromise)
    ]

    @objc func setSpeakerOn(_ call: CAPPluginCall) {
        let speakerOn = call.getBool("speakerOn") ?? false
        DispatchQueue.main.async {
            let session = AVAudioSession.sharedInstance()
            do {
                let options: AVAudioSession.CategoryOptions = speakerOn
                    ? [.allowBluetooth, .allowBluetoothA2DP, .defaultToSpeaker]
                    : [.allowBluetooth, .allowBluetoothA2DP]
                try session.setCategory(.playAndRecord, mode: .voiceChat, options: options)
                try session.setActive(true)
                try session.overrideOutputAudioPort(speakerOn ? .speaker : .none)
                call.resolve()
            } catch {
                call.reject("iOS audio routing error: \(error.localizedDescription)")
            }
        }
    }

    @objc func reset(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let session = AVAudioSession.sharedInstance()
            do {
                try session.overrideOutputAudioPort(.none)
                try session.setActive(false, options: .notifyOthersOnDeactivation)
            } catch {
                // Ignore deactivation error if audio is still tearing down
            }
            call.resolve()
        }
    }
}

class Way2AstroBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(IosAudioTogglePlugin())
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    private var backgroundTaskId: UIBackgroundTaskIdentifier = .invalid

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = Way2AstroBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        if backgroundTaskId == .invalid {
            backgroundTaskId = UIApplication.shared.beginBackgroundTask(withName: "Way2AstroCallKeepAlive") { [weak self] in
                guard let self = self else { return }
                if self.backgroundTaskId != .invalid {
                    UIApplication.shared.endBackgroundTask(self.backgroundTaskId)
                    self.backgroundTaskId = .invalid
                }
            }
        }
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        if backgroundTaskId != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundTaskId)
            backgroundTaskId = .invalid
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
