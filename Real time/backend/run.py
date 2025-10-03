#!/usr/bin/env python3
"""
Realtime Chat Backend - Main Entry Point
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app import app, socketio

def main():
    """Main entry point for the Flask-SocketIO application"""
    
    # Environment configuration
    dev_mode = os.getenv('DEV_MODE', '0') == '1'
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = dev_mode or os.getenv('DEBUG', 'False').lower() == 'true'
    use_firebase = os.getenv('USE_FIREBASE', '1') == '1'
    
    print("=" * 60)
    print("🔮 MATRIX COMMUNICATION BACKEND")
    print("=" * 60)
    print(f"Mode: {'Development' if dev_mode else 'Production'}")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Debug: {debug}")
    print(f"Firebase: {'Enabled' if use_firebase else 'Disabled'}")
    print(f"Default room: general")
    
    if dev_mode:
        print("\n⚠️  DEVELOPMENT MODE ENABLED")
        print("   - Auto-reload: Enabled")
        print("   - Verbose logging: Enabled")
        print("   - Debug mode: Enabled")
    else:
        print("\n🚀 PRODUCTION MODE ENABLED")
        print("   - Optimized performance")
        print("   - Minimal logging")
        print("   - Production security")
    
    print("-" * 60)
    
    try:
        # Run the Flask-SocketIO server
        socketio.run(
            app, 
            debug=debug, 
            host=host, 
            port=port,
            use_reloader=dev_mode,
            log_output=dev_mode,
            allow_unsafe_werkzeug=dev_mode  # Only for development
        )
    except KeyboardInterrupt:
        print("\n🛑 Shutting down gracefully...")
        print("Thank you for using Matrix!")
    except Exception as e:
        print(f"\n❌ ERROR: Failed to start server: {e}")
        print("Please check your configuration and try again.")
        sys.exit(1)

if __name__ == '__main__':
    main()
