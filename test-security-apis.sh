#!/bin/bash

echo "🔧 Testing PDF Security Suite API Endpoints..."
echo "=============================================="
echo ""

# Test server is running
echo "1. Testing server availability..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server is running on http://localhost:3000"
else
    echo "❌ Server is not running. Start with: npm run dev"
    exit 1
fi
echo ""

# Test API endpoints exist (they will return 405 for GET requests, which is expected)
echo "2. Testing API endpoints availability..."

echo "   Testing /api/security/encrypt..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/security/encrypt)
if [ "$STATUS" = "405" ]; then
    echo "   ✅ Encrypt endpoint exists (405 = Method Not Allowed for GET, expects POST)"
else
    echo "   ❌ Encrypt endpoint issue (Status: $STATUS)"
fi

echo "   Testing /api/security/permissions..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/security/permissions)
if [ "$STATUS" = "405" ]; then
    echo "   ✅ Permissions endpoint exists (405 = Method Not Allowed for GET, expects POST)"
else
    echo "   ❌ Permissions endpoint issue (Status: $STATUS)"
fi

echo "   Testing /api/security/watermark..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/security/watermark)
if [ "$STATUS" = "405" ]; then
    echo "   ✅ Watermark endpoint exists (405 = Method Not Allowed for GET, expects POST)"
else
    echo "   ❌ Watermark endpoint issue (Status: $STATUS)"
fi

echo "   Testing /api/security/audit..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/security/audit)
if [ "$STATUS" = "405" ]; then
    echo "   ✅ Audit endpoint exists (405 = Method Not Allowed for GET, expects POST)"
else
    echo "   ❌ Audit endpoint issue (Status: $STATUS)"
fi

echo ""
echo "🎉 API Endpoint Testing Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Navigate to Security Features section"
echo "   3. Upload PDF files to test security features"
echo "   4. Try password protection, permissions, watermarks, and audit logging"
echo ""
echo "📊 Features Ready for Testing:"
echo "   • Password Protection & Encryption"
echo "   • Access Control & Permissions"
echo "   • Security Watermarking"
echo "   • Audit Trail & Logging"
echo ""
