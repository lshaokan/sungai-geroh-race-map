import json, urllib.request, urllib.error, sys
AUTH = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake"
BASE = "http://127.0.0.1:8081/v1/projects/wwsc-river-map-7ab35/databases/(default)/documents"
ADMIN = sys.argv[1] if len(sys.argv) > 1 else ""
LEAD = sys.argv[2] if len(sys.argv) > 2 else ""
op = urllib.request.build_opener(urllib.request.ProxyHandler({}))

def req(m, url, body=None, tok=None):
    h = {"Content-Type": "application/json"}
    if tok: h["Authorization"] = "Bearer " + tok
    r = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None, headers=h, method=m)
    try:
        with op.open(r) as f: return f.status, json.loads(f.read() or b"{}")
    except urllib.error.HTTPError as e:
        try: return e.code, json.loads(e.read())
        except Exception: return e.code, {}

def val(v):
    if isinstance(v, bool): return {"booleanValue": v}
    if isinstance(v, (int, float)): return {"doubleValue": v}
    if isinstance(v, dict): return {"mapValue": {"fields": {k: val(x) for k, x in v.items()}}}
    return {"stringValue": str(v)}
def F(d): return {"fields": {k: val(x) for k, x in d.items()}}
def user():
    c, d = req("POST", AUTH, {"returnSecureToken": True}); return d["idToken"], d["localId"]
def setd(path, data, tok): return req("PATCH", f"{BASE}/{path}", F(data), tok)[0]
def getd(path, tok): return req("GET", f"{BASE}/{path}", None, tok)[0]
def dele(path, tok): return req("DELETE", f"{BASE}/{path}", None, tok)[0]
def lst(col, tok): return req("GET", f"{BASE}/{col}", None, tok)[0]
def add(col, data, tok): return req("POST", f"{BASE}/{col}", F(data), tok)[0]

results = []
def check(name, got, want):
    ok = (got == 200) == want
    results.append(ok); print(("PASS " if ok else "FAIL ") + name + f"  (http {got}, expected {'allowed' if want else 'refused'})")

viewer, vu = user(); ed, eu = user(); ad, au = user(); ed2, eu2 = user()
check("viewer reads plan", lst("items", viewer), True)
check("viewer adds item", setd("items/v1", {"type": "tube", "x": 1, "y": 1}, viewer), False)
check("viewer writes visit (own uid)", add("visits", {"uid": vu, "at": 1, "dev": "iPad"}, viewer), True)
check("viewer writes visit (someone else's uid)", add("visits", {"uid": eu, "at": 1}, viewer), False)
check("viewer reads visits", lst("visits", viewer), False)
check("viewer writes log", add("log", {"uid": vu, "act": "x"}, viewer), False)
check("viewer makes self admin with wrong code", setd(f"members/{vu}", {"name": "Hacker", "role": "admin", "code": "nope"}, viewer), False)
check("viewer makes self admin with no code", setd(f"members/{vu}", {"name": "Hacker", "role": "admin"}, viewer), False)
check("viewer registers someone else", setd(f"members/{eu}", {"name": "X", "dept": "QM"}, viewer), False)
check("register with empty name", setd(f"members/{vu}", {"name": "", "dept": "QM"}, viewer), False)
check("editor registers (no code)", setd(f"members/{eu}", {"name": "Aisha Rahman", "dept": "Activities", "role": "editor", "pk": "aisha_rahman_activities"}, ed), True)
check("editor2 registers", setd(f"members/{eu2}", {"name": "Ben Tan", "dept": "Logistics", "role": "editor", "pk": "ben_tan_logistics"}, ed2), True)
check("admin registers with right code", setd(f"members/{au}", {"name": "Marcus", "dept": "River Safety", "role": "admin", "code": ADMIN}, ad), True)
CR = {"uid": eu, "dept": "Activities", "pk": "aisha_rahman_activities", "by": "Aisha", "at": 1}
check("editor adds item (own, Activities)", setd("items/i1", {"type": "truck", "x": 10, "y": 10, "cr": CR}, ed), True)
check("editor moves own item", setd("items/i1", {"type": "truck", "x": 20, "y": 10, "cr": CR}, ed), True)
check("editor2 moves editor's item", setd("items/i1", {"type": "truck", "x": 25, "y": 10, "cr": CR}, ed2), False)
check("editor2 deletes editor's item", dele("items/i1", ed2), False)
check("editor locks own item", setd("items/i1", {"type": "truck", "x": 20, "y": 10, "locked": True, "cr": CR}, ed), True)
check("editor moves own locked item", setd("items/i1", {"type": "truck", "x": 30, "y": 10, "locked": True, "cr": CR}, ed), False)
check("editor unlocks own locked item", setd("items/i1", {"type": "truck", "x": 20, "y": 10, "cr": CR}, ed), False)
check("editor adds time to own locked item (same place)", setd("items/i1", {"type": "truck", "x": 20, "y": 10, "locked": True, "tm": "10:30", "cr": CR}, ed), True)
check("editor deletes own locked item", dele("items/i1", ed), False)
check("admin moves locked item", setd("items/i1", {"type": "truck", "x": 40, "y": 10, "locked": True, "cr": CR}, ad), True)
check("admin unlocks item", setd("items/i1", {"type": "truck", "x": 40, "y": 10, "cr": CR}, ad), True)
check("editor deletes own unlocked item", dele("items/i1", ed), True)
check("item with no owner: editor changes it", setd("items/old1", {"type": "tube", "x": 1, "y": 1}, ed) == 200 and setd("items/old1", {"type": "tube", "x": 2, "y": 1}, ed2), False)
check("item with no owner: admin changes it", setd("items/old1", {"type": "tube", "x": 3, "y": 1}, ad), True)
check("restore someone else's deleted item (create)", setd("items/rest1", {"type": "tube", "x": 1, "y": 1, "cr": CR}, ed2), True)
# department leads
check("editor makes self a lead", setd("leads/ben_tan_logistics", {"dept": "Logistics"}, ed2), False)
check("admin makes editor2 Logistics lead", setd("leads/ben_tan_logistics", {"dept": "Logistics"}, ad), True)
check("anyone signed in reads leads", getd("leads/ben_tan_logistics", viewer), True)
check("lead (Logistics) moves an Activities item", setd("items/rest1", {"type": "tube", "x": 9, "y": 9, "cr": CR}, ed2), False)
ed3, eu3 = user(); setd(f"members/{eu3}", {"name": "Cara Ng", "dept": "Logistics", "role": "editor", "pk": "cara_ng_logistics"}, ed3)
CR3 = {"uid": eu3, "dept": "Logistics", "pk": "cara_ng_logistics", "by": "Cara", "at": 1}
check("Logistics editor adds item", setd("items/lg1", {"type": "truck", "x": 5, "y": 5, "cr": CR3}, ed3), True)
check("lead (Logistics) moves Logistics item", setd("items/lg1", {"type": "truck", "x": 6, "y": 5, "cr": CR3}, ed2), True)
check("Activities editor moves Logistics item", setd("items/lg1", {"type": "truck", "x": 7, "y": 5, "cr": CR3}, ed), False)
check("lead locks then can't move locked Logistics item", setd("items/lg1", {"type": "truck", "x": 6, "y": 5, "locked": True, "cr": CR3}, ed2) == 200 and setd("items/lg1", {"type": "truck", "x": 8, "y": 5, "locked": True, "cr": CR3}, ed2), False)
check("admin unlocks Logistics item", setd("items/lg1", {"type": "truck", "x": 6, "y": 5, "cr": CR3}, ad), True)
check("lead deletes Logistics item", dele("items/lg1", ed2), True)
check("lead waypoint rule too", setd("waypoints/w1", {"name": "x", "x": 1, "y": 1, "cr": CR3}, ed3) == 200 and setd("waypoints/w1", {"name": "y", "x": 1, "y": 1, "cr": CR3}, ed2), True)
check("Activities editor edits Logistics waypoint", setd("waypoints/w1", {"name": "z", "x": 1, "y": 1, "cr": CR3}, ed), False)
check("Activities editor erases Logistics drawing", setd("ink/k1", {"kind": "pen", "cr": CR3}, ed3) == 200 and dele("ink/k1", ed), False)
check("admin removes the lead", dele("leads/ben_tan_logistics", ad), True)
check("ex-lead moves Logistics waypoint", setd("waypoints/w1", {"name": "q", "x": 1, "y": 1, "cr": CR3}, ed2), False)
# comments and shared things
check("editor comments", setd("comments/c1", {"on": "item:x", "text": "hi", "cr": CR}, ed), True)
check("someone else deletes the comment", dele("comments/c1", ed2), False)
check("writer deletes own comment", dele("comments/c1", ed), True)
check("admin deletes someone's comment", setd("comments/c2", {"on": "item:x", "text": "hi", "cr": CR}, ed) == 200 and dele("comments/c2", ad), True)
check("anyone bumps comment counts", setd("ccount/all", {"n": {"item:x": 1}}, ed2), True)
check("editor2 edits shared landmark extras", setd("markx/rapids:9", {"notes": "a"}, ed) == 200 and setd("markx/rapids:9", {"notes": "b"}, ed2), True)
check("editor2 writes a photo", setd("photos/p1", {"data": "x", "at": 1}, ed2), True)
check("editor locks preset extras", setd("markx/rapids:5", {"notes": "hi", "locked": True}, ed), True)
check("editor edits notes on locked preset", setd("markx/rapids:5", {"notes": "hi2", "locked": True}, ed), True)
check("editor unlocks preset", setd("markx/rapids:5", {"notes": "hi2"}, ed), False)
check("editor writes bin", setd("bin/items_i1", {"col": "items", "doc": "i1", "at": 1}, ed), True)
check("editor restores (deletes) bin entry", dele("bin/items_i1", ed), True)
check("editor writes own log", add("log", {"uid": eu, "act": "added"}, ed), True)
check("editor writes log as someone else", add("log", {"uid": au, "act": "added"}, ed), False)
check("editor reads log", lst("log", ed), False)
check("editor reads visits", lst("visits", ed), False)
check("editor lists members", lst("members", ed), False)
check("editor reads own member doc", getd(f"members/{eu}", ed), True)
check("editor reads another member doc", getd(f"members/{eu2}", ed), False)
check("editor upgrades self to admin with wrong code", setd(f"members/{eu}", {"name": "Aisha", "role": "admin", "code": "letmein"}, ed), False)
check("editor creates log entry with id", setd("log/t"+eu, {"uid": eu, "act": "real"}, ed), True)
check("editor edits an existing log entry", setd("log/t"+eu, {"uid": eu, "act": "fake"}, ed), False)
check("admin reads log", lst("log", ad), True)
check("admin reads visits", lst("visits", ad), True)
check("admin lists members", lst("members", ad), True)
check("admin deletes a log entry", dele("log/t"+eu, ad), False)
# same person on a second device (same first + last name + department)
ph, pu = user(); setd(f"members/{pu}", {"name": "Aisha Rahman", "dept": "Activities", "role": "editor", "pk": "aisha_rahman_activities"}, ph)
check("Aisha's 2nd device edits her item", setd("items/rest1", {"type": "tube", "x": 2, "y": 2, "cr": CR}, ph), True)
oh, ou = user(); setd(f"members/{ou}", {"name": "Aisha Rahman", "dept": "QM", "role": "editor", "pk": "aisha_rahman_qm"}, oh)
check("same name, other department can't", setd("items/rest1", {"type": "tube", "x": 3, "y": 2, "cr": CR}, oh), False)
check("Aisha's 2nd device deletes her comment", setd("comments/c9", {"on": "item:x", "text": "hi", "cr": CR}, ed) == 200 and dele("comments/c9", ph), True)
# lead by code
lc, lu = user()
check("lead with wrong code", setd(f"members/{lu}", {"name": "Lee Lim", "dept": "Logistics", "role": "lead", "code": "nope", "pk": "lee_lim_logistics"}, lc), False)
check("lead with no code", setd(f"members/{lu}", {"name": "Lee Lim", "dept": "Logistics", "role": "lead", "pk": "lee_lim_logistics"}, lc), False)
check("lead with lead code", setd(f"members/{lu}", {"name": "Lee Lim", "dept": "Logistics", "role": "lead", "code": LEAD, "pk": "lee_lim_logistics"}, lc), True)
check("admin code can't be used as lead and vice versa: lead code as admin", setd(f"members/{lu}", {"name": "Lee Lim", "dept": "Logistics", "role": "admin", "code": LEAD, "pk": "lee_lim_logistics"}, lc), False)
check("Logistics editor adds item for lead test", setd("items/lg9", {"type": "truck", "x": 5, "y": 5, "cr": CR3}, ed3), True)
check("code lead (Logistics) moves Logistics item", setd("items/lg9", {"type": "truck", "x": 9, "y": 5, "cr": CR3}, lc), True)
check("code lead (Logistics) moves Activities item", setd("items/rest1", {"type": "tube", "x": 4, "y": 2, "cr": CR}, lc), False)
check("code lead reads the log", lst("log", lc), False)
check("editor logs out (deletes own member doc)", dele(f"members/{eu}", ed), True)
check("logged-out editor adds item", setd("items/i2", {"type": "tube", "x": 1, "y": 1}, ed), False)
check("logged-out editor still reads plan", lst("items", ed), True)
check("old-style join (team code, no role) still counts as editor", setd(f"members/{vu}", {"name": "Old", "code": "WWSC26"}, viewer), True)
check("old-style member adds item", setd("items/i3", {"type": "tube", "x": 1, "y": 1}, viewer), True)
print(f"\n{sum(results)}/{len(results)} passed")
