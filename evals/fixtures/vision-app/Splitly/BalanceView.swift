import SwiftUI
import RealityKit

struct BalanceView: View {
    @State private var showSettle = false
    let balance: Decimal

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Balance")
                    .font(.system(size: 13))
                Spacer()
                Button {
                    showSettle = true
                } label: {
                    Image(systemName: "arrow.left.arrow.right")
                }
                .frame(width: 30, height: 30)
                Button {
                    shareBalance()
                } label: {
                    Image(systemName: "square.and.arrow.up")
                }
                .frame(width: 30, height: 30)
            }
            Text(balance, format: .currency(code: "EUR"))
                .font(.system(size: 40, weight: .bold))
            Text("Tap to see who owes you")
                .font(.system(size: 10))
                .foregroundStyle(.gray)
                .onTapGesture { showSettle = true }
        }
        .padding(12)
    }

    func shareBalance() {}
}

@main
struct SplitlyApp: App {
    var body: some Scene {
        WindowGroup { BalanceView(balance: 42) }
        ImmersiveSpace(id: "space") { RealityView { _ in } }
    }
}
