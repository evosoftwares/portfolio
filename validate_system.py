#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import json

def validate_translations():
    print("🔍 Validando Sistema de Traduções...")
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract PT and EN objects
    pt_pattern = r'pt:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\},'
    en_pattern = r'en:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}'
    
    pt_match = re.search(pt_pattern, content, re.DOTALL)
    en_match = re.search(en_pattern, content, re.DOTALL)
    
    if not pt_match or not en_match:
        print("❌ Não foi possível extrair objetos de tradução")
        return False
    
    # Extract keys
    pt_keys = set(re.findall(r'"([^"]+)":', pt_match.group(1)))
    en_keys = set(re.findall(r'"([^"]+)":', en_match.group(1)))
    
    print(f"📊 Estatísticas:")
    print(f"   PT keys: {len(pt_keys)}")
    print(f"   EN keys: {len(en_keys)}")
    
    # Check critical sections
    critical_prefixes = ['nav.', 'faq.', 'testimonials.', 'footer.', 'videos.', 'locations.']
    
    for prefix in critical_prefixes:
        pt_section = [k for k in pt_keys if k.startswith(prefix)]
        en_section = [k for k in en_keys if k.startswith(prefix)]
        
        if len(pt_section) == len(en_section):
            print(f"✅ {prefix[:-1].title()}: {len(pt_section)} chaves sincronizadas")
        else:
            print(f"⚠️  {prefix[:-1].title()}: PT={len(pt_section)}, EN={len(en_section)}")
    
    # Check for missing keys
    missing_en = pt_keys - en_keys
    missing_pt = en_keys - pt_keys
    
    if missing_en:
        print(f"❌ Chaves faltando no EN: {len(missing_en)}")
        for key in sorted(list(missing_en)[:3]):
            print(f"   - {key}")
    
    if missing_pt:
        print(f"❌ Chaves faltando no PT: {len(missing_pt)}")
        for key in sorted(list(missing_pt)[:3]):
            print(f"   - {key}")
    
    # Check HTML usage
    html_keys = set(re.findall(r'data-translate="([^"]+)"', content))
    print(f"🏷️  Chaves usadas no HTML: {len(html_keys)}")
    
    # Check for unused translations
    unused_pt = pt_keys - html_keys
    unused_en = en_keys - html_keys
    
    if unused_pt:
        print(f"⚠️  Traduções PT não usadas: {len(unused_pt)}")
    
    # Check for missing translations in HTML
    missing_translations = html_keys - pt_keys
    if missing_translations:
        print(f"❌ HTML usando chaves inexistentes: {len(missing_translations)}")
        for key in sorted(list(missing_translations)[:3]):
            print(f"   - {key}")
    
    # Final verdict
    if not missing_en and not missing_pt and not missing_translations:
        print("\n🎉 SISTEMA VALIDADO COM SUCESSO!")
        print("✅ Todas as chaves estão sincronizadas")
        print("✅ HTML está usando chaves válidas")
        print("✅ Sistema pronto para produção")
        return True
    else:
        print("\n⚠️  SISTEMA PRECISA DE AJUSTES")
        return False

if __name__ == "__main__":
    validate_translations()