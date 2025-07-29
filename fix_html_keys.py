#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

def fix_html_keys():
    print("🔧 Corrigindo chaves HTML...")
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Common fixes based on our semantic structure
    fixes = [
        # Videos section
        ('data-translate="Como Desenvolver um Sistema Web Completo"', 'data-translate="videos.web_systems.title"'),
        ('data-translate="Aprenda os conceitos fundamentais para criar sistemas web robustos e escaláveis do zero."', 'data-translate="videos.web_systems.description"'),
        ('data-translate="12.5k visualizações"', 'data-translate="videos.web_systems.views"'),
        ('data-translate="APIs RESTful: Melhores Práticas"', 'data-translate="videos.apis_rest.title"'),
        ('data-translate="Como criar APIs robustas, seguras e bem documentadas seguindo os padrões REST."', 'data-translate="videos.apis_rest.description"'),
        ('data-translate="15.2k visualizações"', 'data-translate="videos.apis_rest.views"'),
        ('data-translate="Deploy e DevOps para Iniciantes"', 'data-translate="videos.deploy_devops.title"'),
        ('data-translate="Aprenda a fazer deploy de aplicações e implementar CI/CD de forma simples e eficiente."', 'data-translate="videos.deploy_devops.description"'),
        ('data-translate="9.7k visualizações"', 'data-translate="videos.deploy_devops.views"'),
        ('data-translate="Banco de Dados: SQL vs NoSQL"', 'data-translate="videos.databases.title"'),
        ('data-translate="Entenda quando usar cada tipo de banco de dados em seus projetos."', 'data-translate="videos.databases.description"'),
        ('data-translate="11.3k visualizações"', 'data-translate="videos.databases.views"'),
        ('data-translate="Segurança em Aplicações Web"', 'data-translate="videos.security.title"'),
        ('data-translate="Principais vulnerabilidades e como proteger suas aplicações contra ataques."', 'data-translate="videos.security.description"'),
        ('data-translate="7.4k visualizações"', 'data-translate="videos.security.views"'),
        
        # Footer links
        ('data-translate="Links Úteis"', 'data-translate="footer.links.title"'),
        ('data-translate="Nossos Serviços"', 'data-translate="footer.services.title"'),
        ('data-translate="Web Design"', 'data-translate="footer.services.web_design"'),
        ('data-translate="Desenvolvimento Web"', 'data-translate="footer.services.web_dev"'),
        ('data-translate="Gestão de Produtos"', 'data-translate="footer.services.product_management"'),
        ('data-translate="Marketing Digital"', 'data-translate="footer.services.digital_marketing"'),
        
        # Common elements
        ('data-translate="Mais Detalhes"', 'data-translate="common.more_details"'),
        ('data-translate="Carregando"', 'data-translate="common.loading"'),
        
        # Other testimonials
        ('data-translate="De R$ 50 mil para R$ 800 mil por mês! O app que a Evo criou multiplicou nosso faturamento por 16 em 1 ano."', 'data-translate="testimonials.member2.testimonial"'),
        ('data-translate="Meu marketplace saiu do zero e hoje é o maior do segmento. R$ 15 milhões em vendas no primeiro ano!"', 'data-translate="testimonials.member3.testimonial"'),
        ('data-translate="Era garçom, hoje sou CEO de uma fintech que vale R$ 50 milhões. Só tenho que agradecer à Evo!"', 'data-translate="testimonials.member4.testimonial"'),
        ('data-translate="Do Uber para o meu próprio app milionário. 500 mil usuários e R$ 3 milhões faturados em 2 anos."', 'data-translate="testimonials.member5.testimonial"'),
    ]
    
    modified = 0
    for old, new in fixes:
        if old in content:
            content = content.replace(old, new)
            modified += 1
            print(f"✅ {old[:50]}... → {new}")
    
    # Write back
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n🎉 {modified} chaves HTML corrigidas!")

if __name__ == "__main__":
    fix_html_keys()