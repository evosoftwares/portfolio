#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import json

def analyze_translations():
    print("🔍 ANÁLISE COMPLETA DE TRADUÇÕES")
    print("=" * 50)
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract PT and EN objects
    pt_pattern = r'pt:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\},'
    en_pattern = r'en:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}'
    
    pt_match = re.search(pt_pattern, content, re.DOTALL)
    en_match = re.search(en_pattern, content, re.DOTALL)
    
    if not pt_match or not en_match:
        print("❌ Erro ao extrair objetos de tradução")
        return
    
    # Extract keys
    pt_keys = set(re.findall(r'"([^"]+)":', pt_match.group(1)))
    en_keys = set(re.findall(r'"([^"]+)":', en_match.group(1)))
    
    print(f"📊 PT: {len(pt_keys)} chaves | EN: {len(en_keys)} chaves")
    
    # Find missing keys
    missing_en = pt_keys - en_keys
    missing_pt = en_keys - pt_keys
    
    if missing_en:
        print(f"\n❌ FALTANDO NO EN ({len(missing_en)}):")
        for key in sorted(missing_en):
            print(f"   \"{key}\"")
    
    if missing_pt:
        print(f"\n❌ FALTANDO NO PT ({len(missing_pt)}):")
        for key in sorted(missing_pt):
            print(f"   \"{key}\"")
    
    # Check HTML usage
    html_keys = set(re.findall(r'data-translate="([^"]+)"', content))
    
    # Find HTML keys not in translations
    missing_translations = html_keys - pt_keys
    if missing_translations:
        print(f"\n🏷️ HTML USANDO CHAVES INEXISTENTES ({len(missing_translations)}):")
        for key in sorted(list(missing_translations)[:10]):
            print(f"   \"{key}\"")
    
    # Find unused translations
    unused_pt = pt_keys - html_keys
    if unused_pt:
        print(f"\n🗑️ TRADUÇÕES PT NÃO USADAS ({len(unused_pt)}):")
        for key in sorted(list(unused_pt)[:10]):
            print(f"   \"{key}\"")
    
    print("\n" + "=" * 50)
    print("RESUMO:")
    print(f"- Chaves para adicionar no EN: {len(missing_en)}")
    print(f"- Chaves para adicionar no PT: {len(missing_pt)}")
    print(f"- HTML usando chaves inexistentes: {len(missing_translations)}")
    print(f"- Traduções não utilizadas: {len(unused_pt)}")

if __name__ == "__main__":
    analyze_translations()