from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, PngImagePlugin
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
import textwrap

ROOT=Path(__file__).resolve().parents[1]
WEB=ROOT/'src/Portfolio.Web/wwwroot'
font=WEB/'fonts/host-grotesk-500.ttf'
regular=WEB/'fonts/host-grotesk-400.ttf'
im=Image.new('RGB',(1200,630),'#111518'); d=ImageDraw.Draw(im)
def label(x,y,copy,size=26,color='#eaf0f2'):
    d.text((x,y),copy,font=ImageFont.truetype(str(font),size),fill=color)
label(72,48,'u.',62,'#efba52'); label(158,65,'Umut Oku',32)
d.line((72,142,1128,142),fill='#39434b',width=1)
label(72,180,'Many services.',82); label(72,270,'One coherent system.',76)
label(76,396,'.NET / Microservices / Search / Data / Operations',25,'#aeb8c0')
d.line((100,507,1100,507),fill='#59636d',width=2)
for x,name in [(100,'Product'),(350,'Search'),(600,'Data'),(850,'Events'),(1100,'Operations')]:
    d.rounded_rectangle((x-12,495,x+12,519),radius=4,fill='#efba52' if x==350 else '#283239',outline='#efba52' if x==350 else '#74818d',width=2)
    w=d.textlength(name,font=ImageFont.truetype(str(regular),20)); label(x-w/2,540,name,20,'#aeb8c0')
meta=PngImagePlugin.PngInfo(); meta.add_text('Source','Programmatically authored portfolio social card. Umut Oku portfolio, 2026-10-29. Local OFL Host Grotesk. No generated photography.'); meta.add_text('Prompt','A 1200 by 630 portfolio sharing card in graphite and amber, Host Grotesk typography, Umut Oku, Many services. One coherent system., with labelled product, search, data, events and operations.')
im.save(WEB/'assets/social-preview.png',pnginfo=meta,optimize=True)

pdfmetrics.registerFont(TTFont('Host',str(regular)))
pdfmetrics.registerFont(TTFont('HostMedium',str(font)))
target=WEB/'documents/Umut-Oku-CV.pdf'
c=canvas.Canvas(str(target),pagesize=A4)
c.setTitle('Umut Oku | .NET Backend Engineer'); c.setAuthor('Umut Oku')
W,H=A4; margin=44; y=H-45
def text(copy,size=10,color='#25323a',font='Host',leading=None):
    global y
    c.setFillColor(HexColor(color)); c.setFont(font,size)
    words=copy.split(); lines=[]; line=''
    for word in words:
        candidate=(line+' '+word).strip()
        if pdfmetrics.stringWidth(candidate,font,size)>W-2*margin:
            lines.append(line); line=word
        else: line=candidate
    if line: lines.append(line)
    for line in lines:
        c.drawString(margin,y,line); y-=leading or size*1.45
def gap(value=10):
    global y
    y-=value
def heading(copy):
    gap(14); text(copy,12,'#17242d','HostMedium'); gap(4)
def job(company,role,dates,description):
    gap(8); text(f'{company} | {role} | {dates}',10.5,'#17242d','HostMedium'); text(description,9.5)
def footer(page):
    c.setFont('Host',8); c.setFillColor(HexColor('#66747e')); c.drawString(margin,28,'Umut Oku | umut.oku@gmail.com | umutoku.github.io'); c.drawRightString(W-margin,28,str(page))
text('Umut Oku',30,'#17242d','HostMedium'); text('.NET Backend Engineer',14,'#4b5d69'); gap(10)
text('Istanbul, Türkiye | umut.oku@gmail.com',10)
text('linkedin.com/in/umutoku | umutoku.github.io',9)
heading('PROFILE')
text('Backend engineer working across enterprise commerce, payment integrations, product search and event-driven services. Hands-on with .NET microservices, Elasticsearch, messaging, background jobs and operational troubleshooting. Earlier experience spans industrial IoT, technical support and team leadership.')
heading('TECHNICAL FOCUS')
text('C# / ASP.NET Core / REST APIs / CQRS / Microservices / PostgreSQL / SQL Server / Elasticsearch / Redis / Kafka / RabbitMQ / Hangfire / Docker / Kubernetes / Jenkins / ELK',9.5)
heading('EXPERIENCE')
job('Özdisan','Software Engineer','2024–Present','Product, search, identity, order and payment microservices. Elasticsearch indexing and catalog APIs; PostgreSQL projections and Redis cache workflows; Kafka events and Hangfire jobs. Dashboard counts, role handling and streaming exports. Payment-provider integrations and service-level operational diagnosis.')
job('iCredible','Software Developer, Contract','2023–2024','CMS and low-code backend services using .NET, PostgreSQL, Redis, Kafka and Elasticsearch. Integrations with Stripe and exchange APIs.')
job('Fiverr','Software Developer, Freelance','2023–2024','Custom applications, asynchronous messaging with RabbitMQ, SQL data access and full-stack delivery.')
job('KoçDigital','Software Developer','2022–2023','Industrial IoT and asset management. Real-time Modbus data processing, API development and containerised services in cloud environments.')
job('Poldy HR','Technical Team Lead','2021','Technical support, reporting, CRM workflows and integrations.')
job('QNB Finansbank','Technical Coach','2020–2021','Second-level support for digital business services, root-cause analysis and technical knowledge transfer.')
footer(1); c.showPage(); y=H-45
text('Umut Oku',21,'#17242d','HostMedium'); text('Engineering practice & continuous learning',11,'#4b5d69')
heading('SELECTED ENGINEERING WORK')
text('Payments and reconciliation',11,'#17242d','HostMedium'); text('Provider integrations and downstream order/ERP workflows. Explicit state handling for uncertain outcomes, refund checks and repeat-event handling. Recent reconciliation and partial-refund improvements are in development/testing.',9.5); gap(9)
text('Product search and background processing',11,'#17242d','HostMedium'); text('Catalog, category and variant APIs; Elasticsearch indexing and result behaviour; targeted read projections; asynchronous media refresh with Hangfire. Query changes preserve filtering, mapping and pagination contracts.',9.5)
heading('HANDS-ON LEARNING')
for title,desc in [
 ('Distributed architecture','Saga state machines, Event Sourcing, CQRS, MassTransit and service discovery.'),
 ('Observability and cloud','OpenTelemetry, OTLP, Prometheus, Jaeger; Azure Functions, Storage and container workflows.'),
 ('Real-time communication','gRPC streaming, SignalR, queue workers and asynchronous processing.'),
 ('AI and retrieval','Semantic Kernel agents, LangChain, LangGraph, RAG, Ollama and MCP exploration.')]:
    text(title,10,'#17242d','HostMedium'); text(desc,9.5); gap(6)
heading('SELECTED COURSES & CREDENTIALS')
for item in [
 'Developing a Google SRE Culture | Google / Coursera | 2026',
 'Generative AI for .NET Developers with Azure AI Services | Udemy | 2026',
 'Develop Single Agent .NET Applications Using Semantic Kernel | Udemy | 2026',
 'Senior Azure & AWS Workshop | techcareer.net | 2025',
 '.NET Microservices: CQRS & Event Sourcing with Kafka | Udemy | 2024',
 '.Net Core with Elasticsearch | Udemy | 2024',
 'Exam 761: Querying Data with Transact-SQL | Microsoft | 2020']:
    text(item,9.2)
gap(5); text('All 47 learning records and original credential links: umutoku.github.io/credentials.html',9)
c.linkURL('https://umutoku.github.io/credentials.html',(margin,y,W-margin,y+14),relative=0)
heading('EDUCATION')
text('Management Information Systems | İstanbul University | 2019–2024',9.5)
text('MBA | Trakya University | 2016–2018',9.5)
text('Business Administration | Anadolu University | 2013–2016',9.5)
text('Computer Programming | Gedik University | 2011–2013',9.5)
footer(2); c.save()
print(f'Created social preview and two-page CV. Final content y={y:.1f}')
