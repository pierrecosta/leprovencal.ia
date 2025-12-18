
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///provencal2.db'
db = SQLAlchemy(app)
CORS(app)

class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(100))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(200))
    source_url = db.Column(db.String(200))

class Dictionnaire(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mots_francais = db.Column(db.String(200))
    synonymes_francais = db.Column(db.String(200))
    mots_provencal = db.Column(db.String(200))
    eg_provencal = db.Column(db.String(200))
    d_provencal = db.Column(db.String(200))
    a_provencal = db.Column(db.String(200))
    h_provencal = db.Column(db.String(200))
    av_provencal = db.Column(db.String(200))
    p_provencal = db.Column(db.String(200))
    x_provencal = db.Column(db.String(200))
    theme = db.Column(db.String(100))
    categorie = db.Column(db.String(100)) 
    description = db.Column(db.Text)

class Histoire(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(100))
    typologie = db.Column(db.String(30))
    periode = db.Column(db.String(30))
    description_courte = db.Column(db.String(100))
    description_longue = db.Column(db.Text)
    source_url = db.Column(db.String(200))

    def to_dict(self):
      return {
          "id": self.id,
          "titre": self.titre,
          "typologie": self.typologie,
          "periode": self.periode,
          "description_courte": self.description_courte,
          "description_longue": self.description_longue,
          "source_url": self.source_url
      }

@app.route('/api/articles')
def get_articles():
    articles = Article.query.all()
    return jsonify([{
        'titre': a.titre,
        'description': a.description,
        'image_url': a.image_url,
        'source_url': a.source_url
    } for a in articles])


@app.route('/api/dictionnaire')
def get_dictionnaire():
    theme = request.args.get('theme')
    categorie = request.args.get('categorie')
    lettre = request.args.get('lettre')
    search = request.args.get('search', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    sort = request.args.get('sort', 'mots_francais')  # colonne
    order = request.args.get('order', 'asc')  # asc ou desc


    query = Dictionnaire.query

    
    if order == 'desc':
      query = query.order_by(getattr(Dictionnaire, sort).desc())
    else:
      query = query.order_by(getattr(Dictionnaire, sort).asc())
    if theme and theme.lower() != 'tous':
        query = query.filter(Dictionnaire.theme == theme)
    if categorie and categorie.lower() != 'toutes':
        query = query.filter(Dictionnaire.categorie == categorie)
    if lettre and lettre.lower() != 'toutes':
        query = query.filter(Dictionnaire.mots_francais.startswith(lettre))
    if search:
        query = query.filter(Dictionnaire.mots_francais.ilike(f"%{search}%"))

    total = query.count()
    mots = query.offset((page - 1) * limit).limit(limit).all()

    return jsonify({
        'data': [{
            'theme': m.theme,
            'categorie': m.categorie,
            'description': m.description,
            'mots_francais': m.mots_francais,
            'synonymes_francais': m.synonymes_francais,
            'mots_provencal': m.mots_provencal,
            'eg_provencal': m.eg_provencal,
            'd_provencal': m.d_provencal,
            'a_provencal': m.a_provencal,
            'h_provencal': m.h_provencal,
            'av_provencal': m.av_provencal,
            'p_provencal': m.p_provencal,
            'x_provencal': m.x_provencal
        } for m in mots],
        'total': total,
        'page': page,
        'pages': (total + limit - 1) // limit
    })

@app.route('/api/themes')
def get_themes():
    themes = [t[0] for t in Dictionnaire.query.with_entities(Dictionnaire.theme).distinct()]
    return jsonify(themes)


@app.route('/api/categories')
def get_categories():
    theme = request.args.get('theme', 'tous')

    if theme.lower() == 'tous':
        # Retourne toutes les catégories distinctes
        categories = [c[0] for c in Dictionnaire.query.with_entities(Dictionnaire.categorie).distinct()]
    else:
        # Retourne uniquement les catégories liées au thème
        categories = [c[0] for c in Dictionnaire.query.with_entities(Dictionnaire.categorie)
                      .filter(Dictionnaire.theme == theme)
                      .distinct()]

    return jsonify(categories)



@app.route('/api/histoires')
def get_histoires():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 5))
    offset = (page - 1) * limit

    histoires = Histoire.query.offset(offset).limit(limit).all()
    total = Histoire.query.count()

    return jsonify({
        "data": [h.to_dict() for h in histoires],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    })


@app.route('/api/find-histoire')
def find_histoire():
    titre = request.args.get('titre')
    limit = int(request.args.get('limit', 5))

    # Trouver l'index du titre
    all_histoires = Histoire.query.order_by(Histoire.id).all()
    index = next((i for i, h in enumerate(all_histoires) if h.titre == titre), None)

    if index is None:
        return jsonify({"error": "Titre non trouvé"}), 404

    page = (index // limit) + 1
    return jsonify({"page": page})


@app.route('/api/menu-histoires')
def get_menu_histoires():
    # Récupérer toutes les entrées
    histoires = Histoire.query.all()
    
    # Construire le menu dynamique
    menu = {}
    for h in histoires:
        # Niveau 1 : Typologie
        if h.typologie not in menu:
            menu[h.typologie] = {}
        # Niveau 2 : Période
        if h.periode not in menu[h.typologie]:
            menu[h.typologie][h.periode] = []
        # Niveau 3 : Titre
        menu[h.typologie][h.periode].append(h.titre)    
    return jsonify(menu)

@app.route('/api/histoires-details')
def get_histoires_details():
    histoires = Histoire.query.all()
    details = {h.titre: h.description_courte for h in histoires}
    return jsonify(details)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
